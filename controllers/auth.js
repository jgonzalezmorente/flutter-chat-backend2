const { response } = require( 'express' );
const bcrypt = require( 'bcryptjs' );
const Usuario = require( '../models/usuario' );
const { generarJWT } = require('../helpers/jwt');


const crearUsuario = async ( req, res = response ) => {

    const { email, password } = req.body;

    try {

        const existeEmail = await Usuario.findOne({ email });
        if ( existeEmail ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        const usuario = new Usuario( req.body );

        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );

        await usuario.save();
        
        const token = await generarJWT( usuario.id );

        res.json({
            ok: true,
            usuario,
            token
        });
        
    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        });
        
    }
}


const login = async ( req, res = response ) => {

    try {

        const { email, password } = req.body;
        const usuarioDB = await Usuario.findOne( { email } );
        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'Email no encontrado'
            });
        }

        const validPassword = bcrypt.compareSync( password, usuarioDB.password );
        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña no es válida'
            });
        }

        const token = await generarJWT( usuarioDB.id );
        
        return res.json({
            ok: true,
            usuarioDB,
            token
        });
        
        
    } catch (error) {

        console.log(error);

        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

const renewToken = async ( req, res = response ) => {

    const uid = req.uid;
    const token = await generarJWT( uid );    
    const usuario = await Usuario.findById( uid );

    return res.json({
        ok: true,
        usuario,
        token
    });
}


module.exports = {
    crearUsuario,
    login,
    renewToken
}