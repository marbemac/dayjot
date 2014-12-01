class SessionsController < Devise::SessionsController
  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    data = {
      user_token: resource.authentication_token,
      user_email: resource.email
    }
    render json: data, status: 201
  end

  def destroy
    sign_out :user
    render json: {}, status: :accepted
  end
end
