# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

["Acme", "Smith Holdings", "Mom's Real Estate", "Homer Inc.", "Howl's Magic Real Estate"].each do |client_name|
  client = Client.find_or_create_by!(name: client_name)

  # Seed buildings for each client
  5.times do |i|
    Building.find_or_create_by!(
      address: "#{i+1}#{i+1}#{i+1} main st.",
      state_code: "NY",
      zipcode: "1000#{i+1}",
      client_id: client.id
    )
  end
end
