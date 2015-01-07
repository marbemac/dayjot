require "rails_helper"

RSpec.describe Entry, :type => :model do
  describe "validations" do

    it { should belong_to(:user).class_name('User') }

    it { should validate_presence_of(:user) }
    it { should validate_presence_of(:entry_date) }
    it { should validate_presence_of(:body) }

    it { should ensure_length_of(:body).is_at_most(50000) }

  end
end
