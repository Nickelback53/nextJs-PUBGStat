import { Button, Header, Container, List , Statistic } from "semantic-ui-react";
import styles from "./Stats.module.css";

export default function Item({ player }) {

    return (
        <Container className={styles.con} textAlign='justified'>
            <Header as='h2'>{player.name}</Header>
            <List bulleted>
                {
                    Object.entries(player).map((entrie, idx) => {
                        if (entrie[0] !== 'id') {
                            return (
                                // <List.Item>{entrie[0]}: {entrie[1]}</List.Item>
                                <List.Item key={idx}>
                                <Statistic horizontal>
                                    <Statistic.Label>{entrie[0]}:</Statistic.Label>
                                    &nbsp;&nbsp;
                                    {entrie[1]}

                                </Statistic>
                                </List.Item>
                            )
                        }
                    })
                }
            </List>
        </Container>
    )
} 