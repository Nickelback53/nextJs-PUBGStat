import { Header } from "semantic-ui-react";
import Gnb from "./Gnb";

export default function Top() {
    return (
        <div>
            <div style={{ display: 'flex', paddingTop:20 }}>
                <div style={{ flex: '100px 0 0' }}>
                    <img
                        src="/images/logo.jpeg"
                        alt="logo"
                        style={{ display: "block", width: 80 , marginTop: 20}}
                    />
                </div>
                <Header as="h1">Squad Statistics</Header>
            </div>
            <Gnb />
        </div>
    )
}