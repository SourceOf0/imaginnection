module UsersHelper

  # 共感ボタンの名称のハッシュ
  def empathy_button_kind_hash
    return @empathy_button_kind_hash = {
      0 => "同感",
      1 => "わかる",
      2 => "それな",
      3 => "わかりみ",
    }
  end
  
  # 共感ボタンの種類一覧を取得
  def empathy_button_kind_list
    return empathy_button_kind_hash.keys
  end
  
  # 共感ボタンの名称の一覧を取得
  def empathy_button_name_list
    return empathy_button_kind_hash.values
  end

  # 設定中の共感ボタンの名称を取得
  def empathy_button_name
    return empathy_button_kind_hash[current_user.empathy_button_kind]
  end
  
end
