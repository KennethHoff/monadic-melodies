defmodule SpotifyPlayerWeb.PageController do
  use SpotifyPlayerWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
