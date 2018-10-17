module Main exposing (main)

import Html exposing (Html, text, div, p, table, tr, td, th, thead, tbody)
import Http
import Types exposing (..)
import Json.Decode as Decode
import Dict


type JsVal
    = JsString String
    | JsInt Int
    | JsFloat Float
    | JsArray (List JsVal)
    | JsObject (Dict.Dict String JsVal)
    | JsNull


jsValDecoder : Decode.Decoder JsVal
jsValDecoder =
    Decode.oneOf
        [ Decode.map JsString Decode.string
        , Decode.map JsInt Decode.int
        , Decode.map JsFloat Decode.float
        , Decode.list (Decode.lazy (\_ -> jsValDecoder)) |> Decode.map JsArray
        , Decode.dict (Decode.lazy (\_ -> jsValDecoder)) |> Decode.map JsObject
        , Decode.null JsNull
        ]


main : Html msg
main =
    view initialModel


initialModel : Model
initialModel =
    Model
        "What"
        [ Contact "John Doe" Male "1995-10-16"
        , Contact "Anna Smith" Female "1986-03-08"
        ]


getContacts : Cmd Msg
getContacts =
    let
        contactsUrl =
            "/adius/lamda/api/dropbox?path=Contacts"

        request =
            Http.get contactsUrl jsValDecoder
    in
        Http.send ContactsLoaded request



-- UPDATE


type Msg
    = Reset
    | Search
    | ContactsLoaded (Result Http.Error (List Contact))


update : Msg -> Model -> Model
update msg model =
    case msg of
        Reset ->
            { model | contacts = [] }

        Search ->
            { model | contacts = [] }

        ContactsLoaded (Ok contacts) ->
            { model | contacts = contacts }

        ContactsLoaded (Err _) ->
            model



-- VIEW


contactToRow : Contact -> Html msg
contactToRow contact =
    tr []
        [ td [] [ text contact.name ]
        , td [] [ text (toString contact.gender) ]
        , td [] [ text contact.birthday ]
        ]


view : Model -> Html msg
view model =
    table
        []
        [ thead []
            [ tr []
                [ th [] [ text "Name" ]
                , th [] [ text "Gender" ]
                , th [] [ text "Birthday" ]
                ]
            ]
        , tbody []
            (List.map
                contactToRow
                model.contacts
            )
        ]
