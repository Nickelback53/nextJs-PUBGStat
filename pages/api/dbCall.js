import db from '../../src/common/config/db/db';

export default function handler(req, res) {

    if (req.method === 'POST') {
        let players = [];
        players.push(req.body.player.name.replace(/,/g, ' ').split(' '));
        Array.isArray(players);

        db.query("select * from PUBG_STAT where name in (?) ", [players[0]], (err, rows) => {
            if (err) throw err;
            let newPlayerCheck;
            // if(players[0].length !== rows.length){
            //     for (let i = 0; i < players[0].length; i++) {
            //         newPlayerCheck = 0;
            //         for (let j = 0; j < rows.length; j++) {
            //             if (players[0][i] === rows[j].name) {
            //                 newPlayerCheck = 1;
            //             }
            //         }
            //         if (newPlayerCheck === 0) {

            //             db.query(`insert into PUBG_STAT ( season, name, currentTier,  currentRankPoint,   bestRankPoint,
            //                     roundsPlayed, wins, kills,   assists,  teamKills,  avgDamage, kda, winRatio,  top10Ratio)
            //                 values( 0 , ?, 0 ,0 , 0, 0 , 0 , 0 , 0 , 0 ,0,0,0, 0)`,
            //                 [players[0][i]],
            //                 function (err2, rows) {
            //                     if (err2) {
            //                         throw err2;
            //                     }

            //                 }
            //             )
            //         }
            //     }

            // }
            res.status(200).json({ data: rows })
        })
    }


}

export async function getData(name) {
    return new Promise(function (resolve, reject) {
        db.query("select * from PUBG_STAT where name in (?)", [name], (err, rows) => {
            if (err) throw err;
            let result = Object.values(JSON.parse(JSON.stringify(rows)));
            // console.log(result);
            // return result;
            resolve(result[0]);
        })
    })
}
