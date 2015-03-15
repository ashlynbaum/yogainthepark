#API Documentation for Events

## POST /event
takes data from these params, and creates this database record

+ Request (application/json)

        {
          "type": "event",
          "title" : "event name",
          "description" :"",
          "creator name" : "",
          "user_id": ""
          "location_name" : "",
          "location" : "",
          "event_date" : "",
          "event_start_time" : "",
          "event_end_time" : "",
          "price" : "",
          "required_materials" : "",
          "imgs"; ["url", "url", ...],            
        }
        
+ Response 202 (application/json)
        
        {
          "response": "success"
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
          "_id": "",
          "event_time_zone" : "UTM",
          "Position": {
           "Longitude": 9.96233,
           "Latitude": 49.80404
           },
          "type": "event",
          "title" : "event name",
          "description" :"",
          "creator name" : "",
          "user_id": ""
          "location_name" : "",
          "location" : "",
          "event_date" : "",
          "event_start_time" : "",
          "event_end_time" : "",
          "price" : "",
          "required_materials" : "",
          "imgs"; ["url", "url", ...],    

         },...]



## GET /event/{id}
+ Response 200 (application/json)

        {
         "_id": "",
         "event_time_zone" : "UTM",
         "Position": {
          "Longitude": 9.96233,
          "Latitude": 49.80404
          },
         "type": "event",
         "title" : "event name",
         "description" :"",
         "creator name" : "",
         "user_id": ""
         "location_name" : "",
         "location" : "",
         "event_date" : "",
         "event_start_time" : "",
         "event_end_time" : "",
         "price" : "",
         "required_materials" : "",
         "imgs"; ["url", "url", ...],    

         }
  
## DELETE /event/{id}

## POST /user
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
		
## GET /user
+Respond
		{
		 ""
		}
		






