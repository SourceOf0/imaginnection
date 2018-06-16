class AddRefIdToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :ref_id, :string, unique: true
  end
end
