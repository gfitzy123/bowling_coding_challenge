 # Bowling Coding Challenge

## Installation
```
 npm install
 ```
 Create postgres database named 'bowling'.
 Create postgres datbase named 'bowling_test'.
 And run migrations with the following commands.
 ```
 run migrate-dev
 run migrate-test
```

## Testing:
```
 npm run test
 ```

## Usage:
 Create a user by making a post request to the /user route with the following json in the request body.
 
```json
  {
   "userId": your_user_id,
  }
```

 Keep track of the user id returned.

 Create a new game by making a post request to the /games route with the follwing json in the request body.
 ```json
  {
   "userId": your_user_id,
   "gameId": your_game_id,
  }
```
 Keep track of the game id returned.

 To throw a bowling ball in your game, make a post request to /throw with the following sample request body: 
 
```json
  {
   "userId": your_user_id,
   "gameId": your_game_id,
   "score": integer_between_one_and_ten
  }
```

 The body of the response will contain the results of your throw, contained in the frame object and the game object.
 
 ## License
[MIT](https://choosealicense.com/licenses/mit/)
