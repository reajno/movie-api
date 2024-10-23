# IFQ716 REPORT

## Introduction

All endpoints are implemented
Show screenshots:

In this assignment, I've developed a REST API using Node.js (**REFERENCE**) which provides client-side web applications transformed movie and streaming data obtained from multiple sources. The documented endpoints for this task were all implemented in the API. A simple client app is also created to demonstrate the functionality of the API.


created a fullstack web app which demonstrates the creation of RESTful API as outlined for this task. External packages such as dotenv and http-server were used to demonstrate the API usage within a local environment. All endpoints are implemented and are usable in the client app.

## Technical description

Using the Node.js "http" module, A custom "routing" function is used to handle different routes HTTP methods for each valid path in the API. In each path, asynchronous functions are called to fetch the requested API data. Instead of using manual string splitting methods to parse the URL, a URL object is created, which is inline with modern standards and provides a robust way to access relevant information. Key details such as the movie title and the movie IMDb ID are extracted from the URL object and passed to the corresponding functions need them to make the necessary API calls. 

(img1)

OMDb API and Streaming Availability API are used to obtain movie data and streaming availability, respectively. These third-party APIs have their own specific configuration for data fetching and error handling, which are transformed to align with the prescribed format for the custom API. For example, OMDb passes the API key via the URL, whereas the API key for Streaming Availability is passed via the custom header "X-RapidAPI-Key". It was essential to understand the API documentation in order to correctly handle fetch calls and manage their responses. 

(img2 + img3)

Third-party module, dotenv (**REFERENCE**), is used to store and manage the private API keys of the  mentioned external APIs integrated into the app. Additionally, Bootstrap is utilised on the client side to assist with the styling and layout of DOM elements to demonstrate the app's functionalities.

-----------------

In my API, six main asynchronous functions were created handle web client fetch requests as outlined by the task:
    - getMoviesList
    - getMovieData
    - getStreamingData
    - getCombinedMovieData
    - getMoviePoster
    - addMoviePoster

These functions are called within the routing handler function and they all take the response object and the movie title or movie IMDb ID as parameters to be used within them. Responses and error handling are also processed independently within these functions to allow for improved readability and separation of concerns. 

The modern "async/await" JavaScript syntax was used throughout the API, with error handling being implemented using "try-catch blocks" for enhanced code readability and modular error management. I preferred this approach over using callbacks for its flexible error handling, even with unexpected edge case errors which could occur from the external resources used.

### /movies/search

In this endpoint, the asynchronous function "getMoviesList" fetches data from OMDb API and returns the JSON data as a response. Using the OMDb API, I discovered that all fetch requests include a "Response" property with a boolean value. A challenge I encountered was that even erroneous requests return a Status 200, with the "Response" property's value as "false". This meant that even though the returned data indicates that an error occured, the server still processes the response as "successful" because a value was successfully returned from the fetch call. I overcame this issue by conditionally throwing an error if the "Response" value was false. Additionally, by encasing the fetch processes within a try-catch block, any caught errors could be easily propagated upwards and returned to the client to ensure proper error handling and feedback. 

(img4)

### /movies/data
For this endpoint, the getMovieData and getStreamingData functions handle the fetch calls to the OMDb API and Streaming Availability API, respectively. In alignment with the prescribed API responses, a server error (status 500) is thrown within each function if an error occurs during the fetch process. If the fetch calls are successful, they return JSON objects which are then further processed within the "getCombinedMovieData" function. 

In "getCombinedMovieData", the returned objects from the fetch calls are combined into a single JSON object. This approach simplifies the presentation of the data to suit the purposes of the custom API. The function directly handles status 400 errors, while any status 500 errors within the individual functions are propagated upwards and returned in the response. 

Initially, I anticipated that handling errors across multiple external data sources for this endpoint would be complex. However, by separating the fetch calls into their own functions and centralising the logic in a parent function to process their results, I was able to streamline error handling operations. This approach not only simplified the process but also made it easier to manage errors consistently across different sources, ensuring maintainability and scalability of the custom API.

----------------
### /posters
For this endpoint, the "getMoviePoster" function is used to retrieve an image file with a matching IMDb ID passed to the function. Node's "path" and "fs" modules are utilised within the function to access the "uploads" folder within the local directory and retrieve the corresponding image file. Once the file is found, it is read and sent to the client as a response. 

(image of 200)

If no file matches the queried IMDb ID, an error is returned to indicate that the poster could not be found. This ensures that only valid posters are retrieved based on the movie's unique ID.

(image of 400)

For the purposes of this assignment, the `getMoviePoster` function only searches the "uploads" folder in the working directory to find the requested image file. However, if the application were to be released to production, this approach could be modified to query an external database or a dedicated cloud storage service for the poster files. This would improve the application scalability and is better suited for handling large datasets or multiple users accessing the data simultaneously.
### /posters/add

The "addMoviePoster" function handles image uploads from the client. Due to the specified endpoint request being a POST method, an OPTIONS preflight request is first sent by the browser to verify if the server allows the POST request. The server then responds with preflight headers to confirm that the action can be performed. Once these headers are received by the client, the image upload is initiated. The image data is transmitted in binary chunks, which the server processes and combines into a readable buffer. Once the entire data is received, the buffer is then written into the "uploads" folder found within the working directory where the project is initiated. In this folder, the uploaded image is renamed to the movie's unique IMDb ID.

(image of 200)

Errors for this endpoint are handled both before the image data is processed and after the image data is fully received. This is done to ensure any errors throughout the process are caught and managed gracefully. While the errors currently default to a status 400 response code, the function can be easily modified to provide more specific information about the error if required. 

(image of 400)

During development testing in a browser client, I used the VS Code "Live Server" extension for its fast auto-reloading feature. However, when testing the POST request function, I encountered an issue where the client would automatically reload and lose the rendered data from the previous session before the POST request completed. Although the API itself worked as expected (E.G. the image is uploaded to the directory correctly), the response was lost due to the page refresh. I identified that "Live Server" was causing this issue due to the extension constantly scanning the directory and its files for any changes. Thus, the newly uploaded file in the local directory would trigger a page refresh. To fix this, I switched to using Node's "http-server", which doesn't support auto-reloading. This allows the app to behave as what would be expected in a production environment, without unexpected page refreshes.
