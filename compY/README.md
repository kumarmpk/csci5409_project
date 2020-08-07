End point for Company Y

HOME PAGE
http://a7companyy.s3-website-us-east-1.amazonaws.com/

GET https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/parts
Return all the parts from the parts DB

GET https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/parts/:id
Return specific part with id from the parts DB

POST https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/parts/create
Create new part and then store the data into parts DB
It will check if the part is exist or not
Parameter need to specify when create new part: partId, partName, qoh

PUT https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/parts/update
Update part and then store the data into parts DB
It will check if the part is exist or not
Parameter need to specify when update part: partId, partName, qoh

GET https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/order
Return all the partsOrder from the partorderY DB
Displayed in a sorted order, first by jobName, then by userId, and then by partId

POST https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/orders
Create new partsOrder and then store the data into partorderY DB
Parameter need to specify when create new orders: transactionName, order: [{jobName, partId, userId, qty }]

POST https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/orders/finish
Create new partsOrder and then store the data into partorderY DB
Parameter need to finish orders: operationType, transactionName
