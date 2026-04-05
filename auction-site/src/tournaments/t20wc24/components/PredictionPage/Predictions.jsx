import React from "react";
import tukeshImg from "../../assets/tukesh.jpeg";

function Predictions() {
  return (
    <div className='pred-main'>
      <h2>Predictions</h2>
      <div className="pred-table container">
        <table>
          <tr>
            <td>Subu</td>
            <td>
              <ul>
                <li>Kohli disastrous t20 wc loading mark this</li>
                <li>Rohit going to shut haters</li>
                <li>Pak out in grp stage and us reach super 8</li>
                <li>Ned to make it to super 8</li>
                <li>Super 8 grp A upset loading</li>
                <li>Upset to ind or aus</li>
                <li>If wi vs afg is not semis, then one of them if wc</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>Yukesh</td>
            <td>
              <img src={tukeshImg} alt="" />
              <p>Warner than player of the tournaments</p>
              <p>rinku ilama india wont win icc tournament</p>
            </td>

          </tr>
          </table>
      </div>
    </div>
  )
}

export default Predictions