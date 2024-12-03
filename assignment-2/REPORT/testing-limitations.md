## Testing and limitations

In this application, endpoints as outlined by the assignment task has been implemented in full. These functionalities are as follows:

- SQL database queries: Testing of valid and invalid queries
- User Registration: Tested with valid and invalid emails and passwords
- Login Endpoint: Tested with correct and incorrect email/password combinations, including invalid or expired tokens.
- Image Upload: Tested image uploads with different formats, sizes, and missing or invalid data.
- Request Validation: Created middleware to address erroneous URL parameters and queries.
- User Authentication: Tested session storage to store server generated JWT.

The application is designed to handle common errors and edge cases without crashing. In case of service failures (e.g., database or external API), it returns meaningful error messages to the user, ensuring the user experience is not disrupted. - The system is resilient to incorrect inputs, with clear validation checks in place to prevent invalid data (e.g., non-image files, empty fields). While not all error handling has been accounted for, these features can be implemented in the future for stricter validation. Examples of this includes the validation of a correct email format and setting a minimum password length for user registrations. 

For file uploads, built-in error handling has been utilised in multer to limit the file size. THis gives an error code of "LIMIT_FILE_SIZE", which is built into multer. URL parameter and query validation middleware were also implemented to catch erroneous request values being sent to the application. If all the values pass the validation middleware functions, expected errors are handled directly in each endpoint to ensure graceful handling. If an error occurs outside of these bounds, "handleError" then defaults to a status code of 500 and provides the generated error message for feedback.

The application is designed to handle common errors and edge cases without crashing. - In case of service failures (e.g., database or external API), it returns meaningful error messages to the user, ensuring the user experience is not disrupted. - The system is resilient to incorrect inputs, with clear validation checks in place to prevent invalid data (e.g., non-image files, empty fields).

Service Failures and API Limitations

Because the database is stored in a local MySQL database, the API may fail if the SQL connection is not running. This will result in a server error. Some limitations were put in place for security reasons. For example, the API only expects PNG image files. While formats such as JPG and GIF are valid files, this was done to streamline the database files and avoid malicious files from being uploaded. 

In the future, retry mechanisms and fallbacks could be implemented to handle intermittent service failures.