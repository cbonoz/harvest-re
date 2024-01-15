# Create a FastAPI server that imports RedfinModel from redfin_harvest.ipynb and serves the model


# Import libraries
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import json

# Import RedfinModel from redfin_harvest.ipynb
from model_lib import RedfinModel

# Create FastAPI server
app = FastAPI()

class BasicSearchPayload(BaseModel):
    query: str

# search endpoint
@app.post("/predict")
async def predict(payload: BasicSearchPayload):
    query = payload.query
    # Run the model
    redfin = RedfinModel(query, {
      'style': ['SINGLE_FAMILY', 'TOWNHOUSE'],
      'beds': [3, 4, 5]
    })
    train_df = redfin.fetch_data('sold')
    redfin.train_from_raw(train_df, train_df[RedfinModel.TARGET_COLUMN])
    test_df = redfin.fetch_data('for_sale')
# test_df = redfin.filter_data(test_df)
    result_df = redfin.predict(test_df)[RedfinModel.OUTPUT_COLUMNS]
    return JSONResponse(content=json.loads(result_df.to_json(orient='records')), status_code=200)


