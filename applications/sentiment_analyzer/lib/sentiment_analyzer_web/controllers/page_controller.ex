defmodule SentimentAnalyzerWeb.PageController do
  use SentimentAnalyzerWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
