RSpec.shared_examples_for "relationship STI" do
  
  # 始点のユーザがなければ無効な状態であること
  it { is_expected.to validate_presence_of(:from_user_id) }
  # 終点のユーザがなければ無効な状態であること
  it { is_expected.to validate_presence_of(:to_user_id) }
  
  # ユーザー単位では重複したユーザの登録を許可しないこと
  # 二人のユーザーが同じユーザを登録することは許可すること
  it { is_expected.to validate_uniqueness_of(:to_user_id).scoped_to(:from_user_id) }

end