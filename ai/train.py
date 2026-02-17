import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Sample training data (crowd pattern by hour)
data = {
    "hour": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    "route_count": [15, 30, 50, 70, 90, 85, 65, 45, 30, 20]
}

df = pd.DataFrame(data)

X = df[["hour"]]
y = df["route_count"]

model = LinearRegression()
model.fit(X, y)

joblib.dump(model, "crowd_model.pkl")

print("✅ AI model trained and saved as crowd_model.pkl")
