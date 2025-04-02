# 🚀 RESTful API with Node.js, TypeScript & AWS (Serverless Framework)


> ℹ️ **About this API**  
> This RESTful API is designed to manage a registry of **Raspberry Pi devices**.  
> It supports full **CRUD operations** (Create, Read, Update, Delete) for managing Pi configurations, device metadata, and status — ideal for IoT management systems that relies on raspberry pis.


This project is a serverless RESTful API built with **Node.js** and **TypeScript**, deployed on **AWS Lambda**, exposed via **API Gateway**, and using **DynamoDB** for storage. It’s developed using the **Serverless Framework** for simplified deployment and infrastructure management.

---

## 🔧 Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Infrastructure as Code:** [Serverless Framework](https://www.serverless.com/)
- **Cloud Services:**
  - AWS Lambda
  - API Gateway
  - DynamoDB
- **CI/CD:** GitHub Actions

---

## 📁 Project Structure

```
.
├── src/
│   ├── handlers/          # Lambda handlers (CRUD)
│   ├── models/            # TypeScript interfaces/models
│   └── utils/             # Helper functions
├── serverless.yml         # Serverless service definition
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🛠️ Setup

### 1. Clone the repo
```bash
git clone https://github.com/hamletrp/pis-mgmt.git
cd pis-mgmt
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Set AWS credentials locally or use environment variables / GitHub Actions secrets.

### 4. Deploy to AWS
```bash
sls deploy --stage dev
```

---

## 🧪 Running Locally

Use the [serverless-offline](https://www.npmjs.com/package/serverless-offline) plugin:

```bash
npm install --save-dev serverless-offline
sls offline start
```

---

## 📦 Available Endpoints

| Method | Endpoint             | Description         |
|--------|--------------------- |---------------------|
| GET    | `/ps-adm`            | List all items      |
| GET    | `/ps-adm/{pk}/{sk}` | Get item by key     |
| POST   | `/ps-adm`            | Create new item     |
| PUT    | `/ps-adm/{pk}/{sk}` | Update item         |
| DELETE | `/ps-adm/{pk}/{sk}` | Delete item         |

> Exact routes are defined in `serverless.yml`.

---

## ✅ Testing

```bash
npm test
```

Unit tests cover:
- Lambda handlers
- DynamoDB interactions (mocked)
- Input validation and error handling

---

## 🚀 CI/CD

This repo uses **GitHub Actions**:
- Runs tests on every push
- Deploys to **prod** environment on `main`
- Deploys to **dev** environment on other branches

Secrets (`AWS_ACCESS_KEY_ID`, etc.) are stored per environment.

---

## 📄 License

MIT

---

## ✨ Credits

Built with 💻 using:
- [Serverless Framework](https://www.serverless.com/)
- [AWS](https://aws.amazon.com/)
- [TypeScript](https://www.typescriptlang.org/)



---

## 📬 Example Requests

### Create an Item
```http
POST /ps-adm
Content-Type: application/json

{
  "pk": "pk-9748",
  "sk": "config",
  "device_type": "raspberryPi",
  "device_wait": 5000,
  "distance_range_meters": 50,
  "door_name": "North Entrance",
  "door_no": 1,
  "endpoint_protocol": "mqtt",
  "geolocation_coordinates": {
      "latitude": 18.4807173,
      "longitude": -69.929942
  },
  "is_sharedwifi": true,
  "mqtt_endpoint": "XXXXXXXX-ats.iot.us-east-1.amazonaws.com",
  "mqtt_topic": "us/us-east-1/hamletrp@gmail.com/co.PErYw6OJjN/buildingedgardoor1",
  "mqtt_topic_format": "country/region/account/location/device_id"
}
```

### Get All Items
```http
GET /ps-adm
```

### Get Item by Key
```http
GET /ps-adm/pk-65673/config
```

### Update an Item
```http
PUT /ps-adm/pk-123/config
Content-Type: application/json

{
  "device_type": "raspberryPi zero",
  "device_wait": 3000
}
```

### Delete an Item
```http
DELETE /ps-adm/pk-123/config
```
