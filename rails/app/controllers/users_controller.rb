class UsersController < ApplicationController
  before_action :authenticate_user!, except: [:create, :start_password_reset, :finish_password_reset]
  before_action :assert_reset_token_passed, only: [:finish_password_reset]

  def create
    p = register_params
    # for some reason, rails isn't letting time_zone through, so manually assign it here if present
    p["time_zone"] = params["user"]["time_zone"] if params["user"] && params["user"]["time_zone"].present?
    user = User.new(p)

    if user.save
      render json: user, status: :created
    else
      render json: {errors: user.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def update
    p = user_params
    # for some reason, rails isn't letting time_zone through strong parameters, so manually assign it here if present
    p["time_zone"] = params["user"]["time_zone"] if params["user"] && params["user"]["time_zone"].present?
    
    if current_user.update(p)
      render json: current_user
    else
      render json: {errors: current_user.errors.full_messages}, status: :unprocessable_entity
    end    
  end

  def me
    if current_user
      render json: current_user, status: 200
    else
      render json: {}, status: 400
    end
  end

  def start_password_reset
    user = User.where(email: params[:email]).first
    if user
      user.send_reset_password_instructions
    end
    render json: {}
  end

  def finish_password_reset
    user = User.with_reset_password_token(params[:reset_password_token])
    if user
      if user.reset_password!(reset_params[:password], reset_params[:password_confirmation])
        render json: {}
      else
        render json: {errors: user.errors.full_messages}, status: 400
      end
    else
      render json: {errors: ["Invalid password reset request."]}, status: 403
    end
  end

  private

    def register_params
      params.require(:user).permit(:email, :password, :time_zome)
    end

    def user_params
      params.require(:user).permit(:time_zome, {:email_times => [:monday,:tuesday,:wednesday,:thursday,:friday,:saturday,:sunday]})
    end

    def reset_params
      params.permit(:password, :password_confirmation)
    end

    # Check if a reset_password_token is provided in the request
    def assert_reset_token_passed
      if params[:reset_password_token].blank?
        render json: {errors: ["Invalid password reset request."]}, status: 403
      end
    end
end