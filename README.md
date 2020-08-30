# bowling_coding_challenge

# To setup:

# npm install
# create postgres database named 'bowling'
# create psotgres datbase named 'bowling_test'
# run migrate-dev
# run migrate-test

# To run tests:
# npm run test

# To play:
# Create a user by making a post request to the /user route with the following json in the request body.
#  {
#   "userId": your_user_id,
#  }

# Keep track of the user id returned.

# Create a new game by making a post request to the /games route with the follwing json in the request body.
#  {
#   "userId": your_user_id,
#   "gameId": your_game_id,
#  }

# Keep track of the game id returned.

# To throw a bowling ball in your game, make a post request to /throw with the following sample request body: 

#  {
#   "userId": your_user_id,
#   "gameId": your_game_id,
#   "score": integer_between_one_and_ten
#  }

# The body of the response will contain the results of your throw, contained in the frame object and the game object.