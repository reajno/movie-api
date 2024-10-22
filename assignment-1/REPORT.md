## IFQ716 - REPORT

## Introduction

All endpoints are implemented
Show screenshots:


In thi assignment, I've created a fullstack web app which demonstrates the creation of RESTful API as outlined for this task. External packages such as dotenv and http-server were used to demonstrate the API usage within a local environment. All endpoints are implemented and are usable in the client app.

## Technical description

Using the http module from Node.js, I created a REST API which answers all endpoints as prescribed by the task. A custom callback function called "routing" is used to conditionally process the necessary routes and methods for each path in the API. In each path, custom asynchronous functions are called in order to fetch the requested API data.

Instead of using string splitting methods, a URL object containing necessary information is created for ease of use. Information such as the movie title and the movie IMDb ID is retrieved from the URL object, to be used by the respective functions in order to make the API call.

To create my restful API, external services, OMDb (**REFERENCE**)and Rapid (**REFERENCE**) were used. These established APIs have their own specific configurations for data fetching and error handling and they are transformed to a usable format for the purposes of my API. As an example, OMDb takes the API key via URL, and Rapid access it from custom header.

- *External APIs, OMDb and Rapid were used*
- *These 3P APIs have a pre-set response and are processed accordingly to a usable format for the purposes of my API.*
- *The 3P APIs have different procedures for data fetching and error handling.* 
- *E.g. OMDB takes API key via URL, Rapid reads it from the custom header "X-RapidAPI-Key".*
- Reading the API docs were crucial to understand how to use them and manipulate fetch calls accordingly
- Error handling was done using try catch blocks which can be modular in the way errors can be handled.

- function "getCombinedMovieData" is used to combine results of separate fetch calls
- Done to simplify the data presentation and usage

Third party module, dotenv, is also used to store private api keys for the production of the app. Node path module is used to identify paths in relation to saving image data for the /posters endpoint.

----------------- 
- 6 main API async functions created
	- getMoviesList
	- getMovieData
	- getStreamingData
	- getCombinedData

### /movies
- getMoviesList, getMovieData, and getStreamingData are async functions that fetch the necessary movie information required.
- getMoviesList is a direct call and returns a JSON data response that is sent directly to the client.
- getMovieData and getStreaming data however, return JSON objects.
	- Their results are merged using 'getCombinedMovieData' function.
		After merge, this function sends the server response to the client.

-----------------

### /posters
- getMoviePoster and addMoviePoster
- getMoviePoster
	- uses Node path and filesystem readFile module to access the local directory and obtain the necessary files. 
	- A movie's imdbID is used as the filename to be read and returned as a response from the server.
	- If no files match the queried ID, error is returned.
### /posters/add
- addMoviePoster
	- The client sends an OPTIONS method first to check that the server will allow a POST method.
	- Because this endpoint is a POST method, preflight headers are sent as a response to the client to ensure that this is a valid action to perform.
	- Once preflight headers are received, the function is then called to process the uploaded image file.
	- The image data is received in chunks and gets processed as a buffer by the server. 
	- When fully received and combined as buffer, it is written into the '/uploads' directory of the project with the movie's IMDb ID as the file name.
- Challenges
	- In the development environment, I used VS code live server extension due to its fast auto-reloading capability. However when testing the POST request function, it I encountered an issue where the client would reload itself and lose the rendered data from the previous session prior to the POST request. 
	- The API works, (e.g. image is uploaded to directory correctly) however, the response is lost upon the refresh.
	- I identified that this issue was being triggered by live server directly, due to the new file being uploaded to the local directory. Live server is set up to automatically scan changes within the app's environment. 
	- Fixed issue by using node http-server, which doesn't support auto-reload and mimics the way a production ready app would.
	- In this instance
## References 

## Appendix (installation guide)

Install following from NPM
- dotenv
- http-server
In CLI:
npm run server
npm run client
