
const fs = require( "fs/promises" );
const path = require( "path" );
const express = require( "express" );
const { v4 : uuidv4 } = require( "uuid" );

const app = express();
const port = 3000;

app.use( express.json() );
app.use( express.static( path.join( `${ __dirname }`, "public" ) ) );

app.get( "/notes", ( req, res ) => {
  res.sendFile( path.join( `${ __dirname }`, "public", "notes.html" ) );
} );

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

app.get( "*", ( req, res ) => {
  res.sendFile( path.join( `${ __dirname }`, "public", "index.html" ) );
} );

app.listen( port, () => {
  console.log( `Listening on port ${ port }...` );
} );