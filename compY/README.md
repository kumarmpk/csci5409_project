End point for Company Y

HOME PAGE
http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/

GET http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/parts
Return all the parts from the parts DB

GET http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/parts/:id
Return specific part with id from the parts DB

POST http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/parts/create
Create new part and then store the data into parts DB
It will check if the part is exist or not
Parameter need to specify when create new part: partId, partName, qoh

PUT http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/parts/update
Update part and then store the data into parts DB
It will check if the part is exist or not
Parameter need to specify when update part: partId, partName, qoh

GET http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/order
Return all the partsOrder from the partorderY DB
Displayed in a sorted order, first by jobName, then by userId, and then by partId

POST http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/order
Create new partsOrder and then store the data into partorderY DB
Parameter need to specify when create new part: jobName, partId, userId, qty
