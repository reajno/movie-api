## Testing and limitations

In this application, endpoints as outlined by the assignment task has been implemented in full.
While not all error handling has been accounted for, these features can be implemented within the client in the future for validation. Examples of this includes the validation of a correct email format and setting a minimum password length for user registrations. In "/get/:imdbID", I have implemented a "Content-disposition" header to trigger a download prompt within the client.

Most edge case errors and service failures are handled appropriately using the utility function "throwError" and "handleError". Using try-catch statements, throwError is used trhoughout the app for expected errors that may occur with the usage of the API. When an error is caught, handleError processes the error object and provides useful feedback as where and why the error may have happened.

For file uploads, built-in error handling has been utilised in multer to limit the file size. THis gives an error code of "LIMIT_FILE_SIZE", which is built into multer. URL parameter and query validation middleware were also implemented to catch erroneous request values being sent to the application. If all the values pass the validation middleware functions, expected errors are handled directly in each endpoint to ensure graceful handling. If an error occurs outside of these bounds, "handleError" then defaults to a status code of 500 and provides the generated error message for feedback.

#### 1. **List of Functionality Tested**

Here, you should describe the different features or endpoints of your application that you tested. For example:

- **User Registration**: Tested with valid and invalid emails and passwords.
- **Login Endpoint**: Tested with correct and incorrect email/password combinations, including invalid or expired tokens.
- **Image Upload**: Tested image uploads with different formats, sizes, and missing or invalid data.
- **Image Retrieval**: Tested fetching images with valid and invalid IMDb IDs.

#### 2. **Handling Edge Cases and Errors**

Edge cases are scenarios that are not common but might break the application if not properly handled. For example:

- **Edge Case**: If the user tries to upload an image that exceeds the size limit.
- **Error Handling**: For invalid user login credentials, the system should return a specific error message like "Invalid email or password".

#### 3. **Service Failures and API Limitations**

Service failures can occur due to external dependencies, such as third-party APIs or services your app relies on. The system should be able to handle these failures gracefully. For example:

- If the external database or API fails, your application should return an error message like "Service unavailable" instead of crashing.
- If the API is slow or unavailable, you could implement a retry mechanism or a fallback response.

Robustness of the Application: - The application is designed to handle common errors and edge cases without crashing. - In case of service failures (e.g., database or external API), it returns meaningful error messages to the user, ensuring the user experience is not disrupted. - The system is resilient to incorrect inputs, with clear validation checks in place to prevent invalid data (e.g., non-image files, empty fields). - Retry mechanisms and fallbacks are implemented to handle intermittent service failures.

Limitations of the Specified API:

- **IMDb API**: - Rate-limited to a maximum of 500 requests per day for free-tier users. Exceeding this limit results in HTTP status code `429 Too Many Requests`. - The IMDb API does not guarantee 100% uptime and may occasionally fail due to external issues beyond the control of the app.
- **File Uploads**: - Images must be in PNG format; JPEG or other formats will not be processed. - File size is limited to 5MB per image. Larger files will be rejected with a `413 Payload Too Large` error.
