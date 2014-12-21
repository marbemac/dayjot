Rails.application.routes.draw do

  # ENTRIES
  resources :entries do
    post 'handle_email' => 'entries#handle_email', on: :collection
    post 'export' => 'entries#export', on: :collection
    delete '' => 'entries#destroy_all', on: :collection
  end

  # PLANS
  post 'update_plan' => 'plans#update_plan', as: :update_plan
  post 'update_card' => 'plans#update_card', as: :update_card
  post 'cancel_plan' => 'plans#cancel_plan', as: :cancel_plan

  # PASSWORDS
  post 'start_password_reset' => 'users#start_password_reset'
  put  'finish_password_reset' => 'users#finish_password_reset'
  get  'password-reset' => 'application#index', as: :edit_user_password
  
  # USERS
  devise_for :users, controllers: { sessions: 'sessions' }, :skip => [:passwords]
  resources :users, only: [:create, :update] do 
    get 'me' => 'users#me', on: :collection
  end

  # background processing admin
  match "/delayed_job" => DelayedJobWeb, :anchor => false, via: [:get, :post]    

  # catch-all for ember app
  get '*path' => 'application#index', :constraints => { :format => 'html' }

end
