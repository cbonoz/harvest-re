# Create a FastAPI server that imports RedfinModel from redfin_harvest.ipynb and serves the model


# Import libraries
from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


from pydantic import BaseModel
from typing import Optional
import json
import os

# Import RedfinModel from redfin_harvest.ipynb
from model_lib import RedfinModel

# Create FastAPI server
app = FastAPI()

from dotenv import load_dotenv

load_dotenv()

DEFAULT_FILTERS = {
      'style': ['SINGLE_FAMILY', 'TOWNHOUSE'],
      'beds': [3, 4, 5]
    }

ACCESS_CODE = os.getenv('ACCESS_CODE')
APP_ENV = os.getenv('APP_ENV')

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BasicSearchPayload(BaseModel):
    query: str
    filters: Optional[dict] = None
    access_code: Optional[str] = None

# base router with path /api
router = APIRouter(prefix='/api')

@router.get("")
async def index():
    return JSONResponse(content={'message': 'Welcome to HarvestAI API!'}, status_code=200)

# search endpoint
@router.post("/predict")
async def predict(payload: BasicSearchPayload):
    if APP_ENV == 'prod' and payload.access_code != ACCESS_CODE:
        return JSONResponse(content={'error': 'Invalid access code'}, status_code=401)

    query = payload.query
    filters = payload.filters
    if not filters:
        filters = DEFAULT_FILTERS
    # Run the model
    redfin = RedfinModel(query, filters)
    train_df = redfin.fetch_data('sold')
    redfin.train_from_raw(train_df, train_df[RedfinModel.TARGET_COLUMN])
    test_df = redfin.fetch_data('for_sale')
    # test_df = redfin.filter_data(test_df)
    result_df = redfin.predict(test_df)[RedfinModel.OUTPUT_COLUMNS]
    # sort by 'diff_percent'
    result_df = result_df.sort_values(by=['diff_percent'], ascending=False)
    return JSONResponse(content=json.loads(result_df.to_json(orient='records')), status_code=200)


app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
