#API Documentation for Events

## POST /events
takes data from these params, and creates this database record

+ Request (application/json)


        {
          "type": "event",
          "title": "event name",
          "description":"",
          "creator name": "",
          "user_id": "",
          "location": {
          	"position": {
          		"lat": 0.0,
          		"long": 0.0
          		}
          	"name": "",
          	"city": "",
          	"state": "",
          	"country":""
          	},
          "event_date": "",
          "event_start_time": "",
          "event_end_time": "",
          "price": "",
          "required_materials": "",
          "imgs": ["url", "url"]            
        }
 
       
+ Response 201 (application/json)
        
        {
          "id": "",
          "type": "event",
          "title": "event name",
          "description":"",
          "creator name": "",
          "user_id": "",
          "location": {
          	"position": {
          		"lat": 0.0,
          		"long": 0.0
          		}
          	"name": "",
          	"city": "",
          	"state": "",
          	"country":""
          	},
          "event_date": "",
          "event_start_time": "",
          "event_end_time": "",
          "price": "",
          "required_materials": "",
          "imgs": ["url", "url"]    
        }
        

## GET /events
respond with all events within search criteria 

+ Request optional parameters

		{radius_from_location,
		 city_name,
		 day,
		 week,
		 teacher,
		}

+ Response 200 (application/json)

        [{
          "type": "event",
          "title": "event name",
          "description":"",
          "creator name": "",
          "user_id": "",
          "location": {
          	"position": {
          		"lat": 0.0,
          		"long": 0.0
          		}
          	"name": "",
          	"city": "",
          	"state": "",
          	"country":""
          	},
          "event_date": "",
          "event_start_time": "",
          "event_end_time": "",
          "price": "",
          "required_materials": "",
          "imgs": ["url", "url"]            
        }]



## GET /events/{id}
+ Response 200 (application/json)

        {
          "type": "event",
          "title": "event name",
          "description":"",
          "creator name": "",
          "user_id": "",
          "location": {
          	"position": {
          		"lat": 0.0,
          		"long": 0.0
          		}
          	"name": "",
          	"city": "",
          	"state": "",
          	"country":""
          	},
          "event_date": "",
          "event_start_time": "",
          "event_end_time": "",
          "price": "",
          "required_materials": "",
          "imgs": ["url", "url"]            
        }
## DELETE /events/{id}

## POST /users
+ Request (application/json)

		{
		 "name_first" : "",
		 "name_last" : "",
		 "email": "",
		 "password": "",
		 "password_conf": "",
		 "info" : "",
		 "img": "",
		}
		
## GET /users
+Respond
		{
		 ""
		}
		






