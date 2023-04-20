from flask import Flask
import numpy as np
from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
import traceback
from flask_cors import CORS, cross_origin
import sklearn
# from preprocessing import detect
from preprocessing_v2 import detect_phishing



app = Flask(__name__)
# model = joblib.load('SVM_model.pkl')
try:
    model = joblib.load('models/SVM_model.pkl')
    print('Model loaded')
except Exception as e:
    print('Model loading error')
    print(str(e))
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/getprediction', methods=['GET', 'POST'])


@cross_origin()
def getprediction():
    if model:
        # detect_phishing(url)
        try:
            # get url from request query params
            url = request.args.get('url')
            print(url)
            features = detect_phishing(url)
            print(features)
            # and then predict
            prediction = model.predict([features])
            # print(prediction)
            print("prediction: ", prediction)

            return jsonify({'prediction': str(prediction)})
            # prediction = model.predict(features)
            # # print(prediction)
            # print("prediction: ", prediction)
        except:
            return jsonify({'trace': traceback.format_exc()})

if __name__ == "__main__":
    app.run(debug=True)

# class GetDetect(Resource):
#     def get(self,url):
#         status = False
#         result = ""
#         if detect(url):
#             status = True
#             result = detect(url)
#         return {"status": status,"result":result}

# api.add_resource(GetDetect,"/getdetect/<path:url>")
  

# if __name__ == "__main__": 
#     app.run(debug=True)