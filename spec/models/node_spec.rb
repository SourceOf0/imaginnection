require 'rails_helper'

RSpec.describe Node, type: :model do

  # テストデータをセットアップする
  subject(:node) { FactoryBot.build(:node) }
  
  # 名称がなければ無効であること
  it { is_expected.to validate_presence_of(:name) }
  # 名称は20文字以下であること
  it { is_expected.to validate_length_of(:name).is_at_most(20) }

  
  it "たくさんの注視設定を所有できること" do
    have_data_user = FactoryBot.create(:user, :with_gazes, count: 5)
    expect(have_data_user.gazes.length).to eq 5
  end
  
end
