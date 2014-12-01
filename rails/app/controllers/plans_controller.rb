class PlansController < ApplicationController
  before_action :authenticate_user!

  def update_plan
    @user = current_user
    @user.stripe_token = params[:token]

    if @user.update_plan(params[:plan]) && @user.save
      render json: @user, status: 200
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def cancel_plan
    @user = current_user
    if @user.cancel_plan && @user.save
      render json: @user, status: 200
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
