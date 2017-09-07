Rails.application.routes.draw do
  root 'games#index'

  get 'game_form', to: 'games#form'
  # get 'character_form', to:'character#form'
  # get '/games/:game_id/characters/:id/form', to: 'character#form'
  get 'character_form', to: 'games#character_form'

  resources :games do
    resources :characters
  end
end
