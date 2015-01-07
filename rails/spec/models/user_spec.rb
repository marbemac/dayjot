require "rails_helper"

RSpec.describe User, :type => :model do
  describe "creation" do
    before do
      @user = User.create(:email => "user@localhist", :password => "password123")
    end

    it "sets default settings" do
      expect(@user.trial_end).not_to eq nil
    end

    it "has many entries" do
      should have_many(:entries).dependent(:destroy)
    end
  end

end
