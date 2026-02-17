from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CrowdInput(BaseModel):
    route_count: int

@app.get("/")
def root():
    return {"message": "CampusNav AI is running"}

@app.post("/predict")
def predict_crowd(data: CrowdInput):
    count = data.route_count

    if count < 10:
        crowd = "LOW"
    elif count < 30:
        crowd = "MEDIUM"
    else:
        crowd = "HIGH"

    return {
        "route_count": count,
        "crowd_level": crowd
    }
