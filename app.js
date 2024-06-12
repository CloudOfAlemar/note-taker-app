/*
  Requiring Modules
*/
const fs = require( "fs/promises" );
const path = require( "path" );
const express = require( "express" );
const { v4 : uuidv4 } = require( "uuid" );

const app = express();
const PORT = process.env.PORT || 3001;

/*
  Middleware
*/
app.use( express.json() );
app.use( express.static( path.join( `${ __dirname }`, "public" ) ) );

/*
  Get Endpoint to /notes
    1). Serving the notes.html file from the public folder
*/
app.get( "/notes", ( req, res ) => {
  res.sendFile( path.join( `${ __dirname }`, "public", "notes.html" ) );
} );

/*
  Get Endpoint to /api/notes
    1). Read db.json file
    2). Respond with data as JSON
    3). Check for error types
      - file not found
      - server error
*/
app.get( "/api/notes", ( req, res ) =>  {
  fs.readFile( `${ __dirname }/db/db.json`, "utf-8" )
  .then( data => res.status( 200 ).json( JSON.parse( data ) ) )
  .catch( error => {
    if( error.code === "ENOENT" ) {
      res.status( 404 ).json( { status : "fail", error : "File not found" } );
    } else {
      res.status( 500 ).json( { status : "fail", error : "Server Error" } );
    }
  } );
} );

/*
  Post Endpoint to /api/notes
    1). Read db.json file
    2). Parse the data being read into JSON
    3). Give the request body a unique ID using uuid package
    4). Write the new Note into db.json
    5). Then send a success message
    6). Check for error
*/
app.post( "/api/notes", ( req, res ) => {
  fs.readFile( `${ __dirname }/db/db.json`, "utf-8" )
  .then( data => {
    const parsedData = JSON.parse( data );
    req.body.id = uuidv4();
    parsedData.push( req.body );
    return fs.writeFile( `${ __dirname }/db/db.json`, JSON.stringify( parsedData ),"utf-8" );
  } )
  .then( () => res.status( 201 ).json( { status : "success", message : "Note saved" } ) )
  .catch( error => error );
} );

/*
  Delete Endpoint to /api/notes/:id
    1). Read db.json file
    2). Parse data into an Object
    3). Find the notes that don't match the req.params.id
      - we'll write those to the db.json file
    4). Write the updated notes to db.json file
    5). Send a JSON response of Note deleted
*/
app.delete( "/api/notes/:id", ( req, res ) => {
  fs.readFile( `${ __dirname }/db/db.json`, "utf-8" )
  .then( data => {
    const parsedData = JSON.parse( data );
    const updatedNotes = parsedData.filter( note => note.id !== req.params.id );
    return fs.writeFile( `${ __dirname }/db/db.json`, JSON.stringify( updatedNotes ), "utf-8" );
  } )
  .then( () => res.status( 200 ).json( { status : "success", message : "Note deleted" } ) )
  .catch( error => error );
} );

/*
  Wildcard / Catch All Route
    1). Send index.html file when a req hits this route
*/
app.get( "*", ( req, res ) => {
  res.sendFile( path.join( `${ __dirname }`, "public", "index.html" ) );
} );

app.listen( PORT, () => {
  console.log( `Listening on port ${ PORT }...` );
} );