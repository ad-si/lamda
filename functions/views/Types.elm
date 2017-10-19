module Types exposing (..)

import Json.Decode as Decode
import Json.Encode as Encode


type Gender
    = Male
    | Female
    | Nonbinary


type alias Contact =
    { name : String
    , gender : Gender
    , birthday : String

    --, phones : List Int
    --, email_addresses : List String
    --, organization : String
    --, job : String
    --, iban : String
    --, website : String
    --, address : String
    --, accounts : Dict String String
    }


type alias Model =
    { title : String
    , contacts : List Contact
    }


decodeContacts : Decode.Decoder (List Contact)
decodeContacts =
    Decode.list decodeContact


decodeContact : Decode.Decoder Contact
decodeContact =
    Decode.map3 Contact
        (Decode.field "name" Decode.string)
        (Decode.field "gender" decodeGender)
        (Decode.field "birthday" Decode.string)


encodeContact : Contact -> Encode.Value
encodeContact record =
    Encode.object
        [ ( "name", Encode.string <| record.name )
        , ( "gender", Encode.string <| (toString record.gender) )
        , ( "birthday", Encode.string <| record.birthday )
        ]


parseGender : String -> Decode.Decoder Gender
parseGender genderString =
    case genderString of
        "Female" ->
            Decode.succeed Female

        "Male" ->
            Decode.succeed Male

        "Nonbinary" ->
            Decode.succeed Nonbinary

        _ ->
            Decode.fail ((toString genderString) ++ " is no valid gender")


decodeGender : Decode.Decoder Gender
decodeGender =
    Decode.string
        |> Decode.andThen parseGender


encodeGender : Gender -> Decode.Value
encodeGender =
    toString >> Encode.string
