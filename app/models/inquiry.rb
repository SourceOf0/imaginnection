class Inquiry
  include ActiveModel::Model

  attr_accessor :user_id, :name, :email, :message

  validates :name,   length: { minimum: 1, :too_short => '名前を入力して下さい。'}
  validates :email,  length: { minimum: 3, :too_short => 'メールアドレスを入力して下さい。'}
  validates :message, :presence => { :message => '問い合わせ内容を入力して下さい。'}

end