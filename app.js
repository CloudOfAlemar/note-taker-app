
const fs = require( "fs/promises" );
const express = require( "express" );
const path = require( "path" );

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
    parsedData.push( req.body );
    return fs.writeFile( `${ __dirname }/db/db.json`, JSON.stringify( parsedData ),"utf-8" );
  } )
  .then( () => res.status( 201 ).json( { status : "success", message : "Note saved" } ) )
  .catch( error => error );
} );

app.listen( port, () => {
  console.log( `Listening on port ${ port }...` );
} );