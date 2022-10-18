import { Grid, List, Card, Icon, Image, Statistic, Progress, Container } from 'semantic-ui-react';
import styles from "./RankList.module.css";

export default function RankList({ data }) {

    //랭킹 순서대로 분류
    data.sort(function (user1, user2) {
        console.log("sorting :", user1.name + "[" + user1.currentRankPoint + "]", user2.name + "[" + user2.currentRankPoint + "]");
        if (user1.errorMessage != null) {
            return 1;
        }
        if (user2.errorMessage != null) {
            return -1;
        }
        if (user1.currentRankPoint == user2.currentRankPoint) {
            return 0;
        } else
            if (user1.currentRankPoint > user2.currentRankPoint) {
                return -1;
            } else {
                return 1;
            }
    });
    if (data) {
        return (<>
            <Grid textAlign='center' width={8}>
                <List ordered >

                    {
                        data.map((a, i) => {
                            return (
                                <List.Item href={`/player/${a.name}`} as='a' key={a.id}>{a.name} {a.currentTier} {a.currentRankPoint} </List.Item>
                            )
                        })
                    }
                </List>
            </Grid>
            <br></br>
            <Container className={styles.con}>
            <Card.Group  itemsPerRow={2}>
                {
                    data.map((a, i) => {
                        return (

                            <Card key={a.id} >
                                <Card.Content>
                                    <Card.Header>{a.name}</Card.Header>
                                    <Card.Meta>{a.currentTier} {a.currentRankPoint} <Icon name='twitter' />{a.wins}</Card.Meta>
                                    <Card.Description>
                                        <Statistic.Group widths='three' content='center'>
                                            <Statistic>

                                                <Statistic.Value><Icon name='plane' />{a.roundsPlayed}</Statistic.Value>
                                                <Statistic.Label>Rounds</Statistic.Label>
                                            </Statistic>
                                            <Statistic>
                                                <Statistic.Value>{a.kills}</Statistic.Value>
                                                <Statistic.Label>Kills</Statistic.Label>
                                            </Statistic>
                                            <Statistic>
                                                <Statistic.Value>{a.assists}</Statistic.Value>
                                                <Statistic.Label>Assists</Statistic.Label>
                                            </Statistic>
                                            <Statistic>
                                                <Statistic.Value>{Math.round(Number(a.avgDamage))}</Statistic.Value>
                                                <Statistic.Label>avg_Damage</Statistic.Label>
                                            </Statistic>
                                            <Statistic>
                                                <Statistic.Value >
                                                    {a.bestRankPoint}
                                                </Statistic.Value>
                                                <Statistic.Label>Best
                                                    <br />
                                                    Rank Point
                                                </Statistic.Label>

                                            </Statistic>

                                            <Statistic>
                                                <br/>
                                                <Statistic.Value>
                                                    <Progress percent={Math.round(Number(a.winRatio)* 100)} progress />
                                                </Statistic.Value>
                                                <Statistic.Label>Win Ratio</Statistic.Label>
                                            </Statistic>


                                        </Statistic.Group>
                                    </Card.Description>
                                </Card.Content>

                            </Card>

                        )
                    })
                }
            </Card.Group>
            </Container>
        </>
        )
    }
}