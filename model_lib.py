import os
import pandas as pd
import numpy as np
from datetime import datetime
from homeharvest import scrape_property
from sklearn.model_selection import cross_val_score
from sklearn.feature_extraction import DictVectorizer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor

ACTIVE_MODEL = RandomForestRegressor()
# ACTIVE_MODEL = Pipeline(steps=[
#     ('preprocessor', ColumnTransformer(
#         transformers=[
#             # ('text', TfidfVectorizer(), 'text'),
#             ('num', StandardScaler(), ['sqft', 'beds', 'full_baths']),
#         ])),
#     ('regressor', LinearRegression())
# ])

DATA_FOLDER = 'data'
DAYS_OF_SOLD_HISTORY = 180
MIN_PRICE = 500000
MAX_PRICE = 1_300_000

class RedfinModel:

    TARGET_COLUMN = 'sold_price'
    COLUMNS_TO_ONE_HOT_ENCODE = ['state', 'style', 'city', 'nearby_schools']
    COLUMNS_TO_REMOVE = ['year_built','assessed_value', 'zip_code', 'broker', 'broker_phone', 'broker_website', 'estimated_value', 'last_sold_date','list_price', 'mls_id', 'latitude', 'longitude', 'price_per_sqft', TARGET_COLUMN]
    OUTPUT_COLUMNS = ['readable_address','style', 'sqft', 'beds', 'full_baths', 'list_price', 'predicted', 'diff', 'diff_percent', 'property_url']

    def __init__(self, location, column_filters={}):
        self.model = ACTIVE_MODEL
        self.data_folder = DATA_FOLDER
        self.location = location
        self.column_filters = column_filters


    def fetch_data(self, listing_type="sold"):
        # Generate filename based on current timestamp
        # current_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        today = datetime.today().strftime('%Y-%m-%d')
        location = self.location
        filename = f"{self.data_folder}/{today}|{location}|{listing_type}.csv"

        # check if data already exists in data folder
        if os.path.exists(filename):
            print(f"Using cached data for {location} {listing_type} as of {today}")
            # return data
            return self._filter_data(pd.read_csv(filename))

        past_days = DAYS_OF_SOLD_HISTORY if listing_type == 'sold' else 90

        properties = scrape_property(
          location=location,
          listing_type=listing_type,  # or (for_sale, for_rent, pending)
          past_days=past_days,  # ex: sold in last 30 days - listed in last 30 days if (for_sale, for_rent)

          # date_from="2023-05-01", # alternative to past_days
          # date_to="2023-05-28",

          # mls_only=True,  # only fetch MLS listings
          # proxy="http://user:pass@host:port"  # use a proxy to change your IP address
        )
        print(f"Fetched properties ({len(properties)}): {location} {listing_type}")
        # Export to csv
        properties.to_csv(filename, index=False)
        return self._filter_data(properties)

    def encode_onehot(self, df, cols):
        """
        One-hot encoding is applied to columns specified in a pandas DataFrame.

        Modified from: https://gist.github.com/kljensen/5452382

        Details:

        http://en.wikipedia.org/wiki/One-hot
        http://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html

        @param df pandas DataFrame
        @param cols a list of columns to encode
        @return a DataFrame with one-hot encoding
        """
        vec = DictVectorizer()

        vec_data = pd.DataFrame(vec.fit_transform(df[cols].to_dict(orient='records')).toarray())
        vec_data.columns = vec.get_feature_names_out()
        vec_data.index = df.index

        df = df.drop(cols, axis=1)
        df = df.join(vec_data)

        return df

    def _filter_data(self, data):
        original_shape = data.shape
        # Remove out of range values
        # if 'sold_price' in data.columns.values:
        #     data = data[(data['sold_price'] > MIN_PRICE) & (data['sold_price'] < MAX_PRICE)]
        if 'list_price' in data.columns.values:
            data = data[(data['list_price'] > MIN_PRICE) & (data['list_price'] < MAX_PRICE)]

        for column in self.column_filters:
            # check if value in column filters values
            if column in data.columns.values:
                allowed_values = self.column_filters[column]
                print('filtering column:', column, 'allowed_values:', allowed_values)
                data = data[data[column].isin(allowed_values)]

        # Calculate age of property
        if 'year_built' in data.columns.values:
            current_year = datetime.now().year
            data['age'] = current_year - data['year_built']

        print(f"Filtered data shape: {data.shape} (from {original_shape})")
        return data.convert_dtypes()

    def _process_data(self, data, show_debug=False):


        numeric_cols = data.select_dtypes(include=np.number).columns.values
        columns_to_use = np.concatenate((numeric_cols, RedfinModel.COLUMNS_TO_ONE_HOT_ENCODE))
        columns_to_use = np.setdiff1d(columns_to_use, RedfinModel.COLUMNS_TO_REMOVE)

        # Transform text data
        # tfidf = TfidfVectorizer()
        # text_features = tfidf.fit_transform(data['text'])
        # text_features_df = pd.DataFrame(text_features.toarray(), columns=tfidf.get_feature_names_out())
        # print(f"Text features shape: {text_features_df.shape}")
        # print(text_features_df.head(5))
        # data = pd.concat([data[columns_to_use], text_features_df], axis=1)
        data = data[columns_to_use]
        data = self.encode_onehot(data, RedfinModel.COLUMNS_TO_ONE_HOT_ENCODE)
        # drop original unencoded columns if present

        # Fill missing values or NaN
        data = data.fillna(0)
        if show_debug:
            print('Using columns:', data.columns.values)
            print(f"Processed data shape: {data.shape}")
            print(f"Processed data columns: {len(data.columns.values)}")
        return data

    def show_cross_validation(self, X, y):
        # use cross_val_score
        train = self._process_data(X)
        scores = cross_val_score(self.model, train, y, cv=5)
        print("Cross-validation scores: {}".format(scores))
        mean_score = scores.mean()
        print("Average cross-validation score: {:.2f}".format(mean_score))
        return mean_score


    def train_from_raw(self, X, y, show_debug=True):
        train = self._process_data(X, show_debug)
        self.trained_columns = train.columns.values
        self.model.fit(train, y)
        return self.model

    def predict(self, X, as_df=True):
        if not self.model:
            raise Exception("Model not trained")
        test = self._process_data(X)
        # Drop any columns that are not in the training data
        dropped_columns = np.setdiff1d(test.columns.values, self.trained_columns)
        print(f"Dropping columns: {dropped_columns}")
        test = test.drop(dropped_columns, axis=1)
        # Add columns that are in the training data but not in the test data
        missing_columns = np.setdiff1d(self.trained_columns, test.columns.values)
        print(f"Adding columns: {missing_columns}")
        for column in missing_columns:
            test[column] = 0

        # Reorder columns to match training data
        test = test[self.trained_columns]

        pred = self.model.predict(test)
        print(f"Predicted {len(pred)} values")
        if not as_df:
            return pred
        result_df = X.copy()
            # Find rows with biggest mismatch between listing price and predicted predicted
        result_df['predicted'] = pred
        result_df['diff'] = result_df['predicted'] - result_df['list_price']
        result_df['diff_percent'] = result_df['diff'] / result_df['list_price'] * 100
        result_df['readable_address'] = result_df['street'] + ', ' + result_df['city'] + ', ' + result_df['state']# + ' ' + str(result_df['zip_code'])
        return result_df

    def print_feature_importances(self):
        if not self.model:
            raise Exception("Model not trained")

        # if model is pipeline
        if isinstance(self.model, Pipeline):
            model = self.model.named_steps['regressor']
        else:
            model = self.model

        try:
            importances = model.feature_importances_
        except Exception as e:
            importances = model.coef_
        # Zip with columns and order by importance
        importances = list(zip(self.trained_columns, importances))
        importances.sort(key=lambda x: x[1], reverse=True)
        return importances
