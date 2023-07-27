import { render } from "react-dom"
import "./styles.css"
import App from "./PingPong"
import Intro from "./Intro"

render(
  <Intro>
    <App />
  </Intro>,
  document.getElementById("root"),
)
