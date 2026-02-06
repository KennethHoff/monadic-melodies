defmodule SpotifyPlayer.Repo do
  use Ecto.Repo,
    otp_app: :spotify_player,
    adapter: Ecto.Adapters.Postgres
end
