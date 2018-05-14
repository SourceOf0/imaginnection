
module ControllerMacros
  def login_user(user = nil)
    controller.stub(:authenticate_user!).and_return true
    @request.env["devise.mapping"] = Devise.mappings[:user]
    user ||= FactoryBot.create(:user)
    sign_in user
  end
end
