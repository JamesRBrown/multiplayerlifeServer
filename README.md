# multiplayerlifeServer

Design Objectives:

    The overall goal is to make an asynchronous multiplayer Conway's Game of Life.

    * Follow all normal rules of Conway's Game of Life. (Note that updated time steps are always based on prior cells. Do not update the current cells based on current cells.)
    * The board size should be a minimum of 16 x 16 cells. (Our implementation is dynamic.)
    * The game logic should be "played" and updated server side.
    * The client receives updates and displays them. 
    * The client can click on a cell to make a cell alive or dead.  Each client should be a unique color, (and give the user a choice of a few colors.)  If a user clicks on a cell to make the cell alive, the cell becomes that color.  If a cell were to become alive due to it being dead and having three living neighbors, the new alive cell must be an average of the colors of those three cells.  
    * The game should feel asynchronous in that the screen shouldn't reload to get new game state data.
    * The game should work with one or more browsers watching the game and all able to participate.

Design Q and A:

How do we handle in coming moves?  

    Server:
        - On the server we maintain a move model.
        - The move model is a copy of the game state model. 
        - The move model is adjusted as move messages come in from clients.

    Client: 
        - As a user clicks on a square the client locally toggles between the dead color or the user color, and sends the coordinate information along with the userID to the server. 

How do we process a turn/generation tick?

    Server:
        - We maintain a game state model, this is a model of the current game state.
        - We maintain a move state model, this is a final model of the moves requested by clients, composited as they came in.
        - At the beginning of a tick, the current game state model and the move model are merged, then game rules are applied creating a new game state model in the process and deltas are tracked.
        - A list of the deltas are sent to clients as an updates message. 

    Client:
        - An updates message is received, containing series of coordinates and their respective colors.
        - Each coordinate position on the board is updated with the new color information.  

How do we deal with updates made during pause state?

    - Messages should be sent to server as per usual.  
    - Once the messages are received by server move model is updated.
    - Changes made to the model are pushed out live to the clients.

What things does the server need be sent for a move?

    - We need to know the userID so we can make all user based associations.
    - We need to know the coordinate which was clicked.
    - No state information is required, because all of that is maintained on the server.

What information does the client need to update the board?

    - Client needs a list of changes to make to the board.
    - Each change needs the coordinate to be changed, and the color to change to.
    - No state information is required, as all state information is maintained on server.

How many colors are available?

    - In interest of simplifying the reproductive process, only pure colors are used for the selectable color list. 
    - A pure color is defined a color that has a value of either 0 or 255 in any of the RGB channels, no in between values are allowed.
    - This means we have red, green, and blue. As well as their complements, cyan, purple, and yellow, respectively.  

How do we calculate child colors?

    - First we sum each RGB channel individually for the group of parents involved.
    - Next we divide each RGB channel individually by the number of parents involved. 
    - The result obtained for each channel is applied as the child's respective RGB value.

What happens if a user toggles a square with a different color from them?

    - The first click kills whatever is living in the square.
    - The second click applies the user's color to the square as it's brought to life. 

How do users get their userID?

    - The server assigned the userID on connection, it's basically the connectionID.
    - Since we're going a websocket, the connectionID can be tracked with the socket.

How do we handle race conditions?


Outline of Messaging System:

    To server messages:

        {
            message: move,
            move: {
                coordinate: {x: 0, y: 0},
                color: {r: 0, g: 0, b:0},
                alive: true
            }
        }

        {
            message: play
        }

        {
            message: pause
        }

        {
            message: interval,
            interval: value
        }

    To client messages:

        {
            message: initialize,
            initialize: lifeObj
        }

        {
            message: updates
            updates: [
                0: {
                    coordinate: {x: 0, y: 0},
                    color: {r: 0, g: 0, b:0},
                    alive: true
                },
                1: {
                    coordinate: {x: 1, y: 1},
                    color: {r: 0, g: 0, b:0},
                    alive: false
                }
            ]
        }

        {
            message: play
        }

        {
            message: pause
        }

        {
            message: interval,
            interval: value
        }


