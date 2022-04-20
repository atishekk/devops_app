from io import BytesIO
from PIL import Image
from fastapi import FastAPI, File, HTTPException, UploadFile,Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import tensorflow as tf
from tensorflow.keras.applications.imagenet_utils import decode_predictions
import numpy as np


model = None

app = FastAPI()

templates = Jinja2Templates(directory="templates")

def predict(image: Image.Image):
    image = np.asarray(image.resize((224, 224)))[..., :3]
    image = np.expand_dims(image, 0)
    image = image / 127.5 - 1.0    
    result = decode_predictions(model.predict(image), 4)[0]    
    response = []
    for i, res in enumerate(result):
        resp = {}
        resp["class"] = res[1]
        resp["confidence"] = f"{res[2]*100:0.2f} %"        
        response.append(resp)    
    print(response)
    return response


def read_image(file) -> Image.Image:
    image = Image.open(BytesIO(file))
    return image

@app.on_event("startup")
def load():
    global model
    model = tf.keras.applications.MobileNetV2(weights="imagenet")
    print("Model Loaded")
    print(model.summary())

@app.post("/predict")
async def model_predict(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1] in ("jpg", "jpeg", "png")
    if not ext:
        raise HTTPException(status_code=400, detail="Invalid Image")
    
    img = read_image(await file.read())
    return predict(img)

@app.get("/")
def index(request: Request):
    """Returns the home page template"""
    return templates.TemplateResponse("home.html", {"request": request})

app.mount("/static", StaticFiles(directory="static"), name="static")