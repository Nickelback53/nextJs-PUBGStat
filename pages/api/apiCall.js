import db from '../../src/common/config/db/db';
import Axios from 'axios';

export default async function handler(req, res) {

    if (req.method === 'POST') {
        let apiKey=process.env.NEXT_PUBLIC_SEASON_API_KEY;
        let testApi = new NickelbackPubgAPI(apiKey);
        let responseJson = {};
        let UserList = [];

        try {
            responseJson = await testApi.getPlayerRankList(req.body.player.name);
        } catch (error) {
            console.log(error);
        }
        for (let accountId in responseJson) {
            let userInfo = responseJson[accountId];
            UserList.push(userInfo);
        }
        //console.log(req.body.player.name);
        //console.log(UserList);
        let players = [];
        players.push(req.body.player.name.replace(/,/g, ' ').split(' '));
        Array.isArray(players);
        //console.log(players);
        let list = [];


        /**
         * 입력받은 players로 디비에서 플레이어 유무 체크 없으면 입력, 존재하면 업데이트
         */
        db.query("select * from PUBG_STAT where name in (?) ", [players[0]], (err, rows) => {
            if (err) throw err;
            //console.log("db ",players[0]);
            let newPlayerCheck;
            for (let i = 0; i < UserList.length; i++) {
                newPlayerCheck = 0;
                for (let j = 0; j < rows.length; j++) {
                    if (UserList[i].name === rows[j].name) {
                        newPlayerCheck = 1;


                        if (rows[j].name === UserList[i].name && rows[j].roundsPlayed !== UserList[i].roundsPlayed || rows[j].name === UserList[i].name && rows[j].season !== UserList[i].currentSeasonId) {
                            db.query(`update PUBG_STAT set season = ?, currentTier = ? ,  currentRankPoint = ? ,   bestRankPoint = ? ,
                                    roundsPlayed = ? , wins = ?, kills = ? ,   assists = ? ,  teamKills = ? , avgDamage = ? , kda = ? ,  winRatio = ? ,  top10Ratio = ?
                                where name =?`,
                                [UserList[i].currentSeasonId === undefined ? 0 : UserList[i].currentSeasonId,
                                UserList[i].currentTier === undefined ? 0 : UserList[i].currentTier.tier + UserList[i].currentTier.subTier,
                                UserList[i].currentRankPoint === undefined ? 0 : UserList[i].currentRankPoint,
                                UserList[i].bestRankPoint === undefined ? 0 : UserList[i].bestRankPoint,
                                UserList[i].roundsPlayed === undefined ? 0 : UserList[i].roundsPlayed,
                                UserList[i].wins === undefined ? 0 : UserList[i].wins,
                                UserList[i].kills === undefined ? 0 : UserList[i].kills,
                                UserList[i].assists === undefined ? 0 : UserList[i].assists,
                                UserList[i].teamKills === undefined ? 0 : UserList[i].teamKills,
                                UserList[i].avgDamage === undefined ? 0 : UserList[i].avgDamage,
                                UserList[i].kda === undefined ? 0 : UserList[i].kda,
                                UserList[i].winRatio === undefined ? 0 : UserList[i].winRatio,
                                UserList[i].top10Ratio === undefined ? 0 : UserList[i].top10Ratio,
                                UserList[i].name === undefined ? 0 : UserList[i].name],
                                function (err3, result) {
                                    if (err3) {
                                        throw err3;
                                    }
                                });
                        }
                    }
                }
                if (newPlayerCheck === 0) {

                    db.query(`insert into PUBG_STAT ( season, name, currentTier,  currentRankPoint,   bestRankPoint,
                            roundsPlayed, wins, kills,   assists,  teamKills,  avgDamage, kda, winRatio,  top10Ratio)
                        values( ? , ?, ? ,? , ?, ? , ? , ? , ? , ? ,?,?,?, ?)`,
                        [UserList[i].currentSeasonId === undefined ? 0 : UserList[i].currentSeasonId,
                        UserList[i].name === undefined ? 0 : UserList[i].name,
                        UserList[i].currentTier === undefined ? 0 : UserList[i].currentTier.tier + UserList[i].currentTier.subTier,
                        UserList[i].currentRankPoint === undefined ? 0 : UserList[i].currentRankPoint,
                        UserList[i].bestRankPoint === undefined ? 0 : UserList[i].bestRankPoint,
                        UserList[i].roundsPlayed === undefined ? 0 : UserList[i].roundsPlayed,
                        UserList[i].wins === undefined ? 0 : UserList[i].wins,
                        UserList[i].kills === undefined ? 0 : UserList[i].kills,
                        UserList[i].assists === undefined ? 0 : UserList[i].assists,
                        UserList[i].teamKills === undefined ? 0 : UserList[i].teamKills,
                        UserList[i].avgDamage === undefined ? 0 : UserList[i].avgDamage,
                        UserList[i].kda === undefined ? 0 : UserList[i].kda,
                        UserList[i].winRatio === undefined ? 0 : UserList[i].winRatio,
                        UserList[i].top10Ratio === undefined ? 0 : UserList[i].top10Ratio],
                        function (err2, result2) {
                            if (err2) {
                                throw err2;
                            }

                        }
                    )
                }
            }

            list.push(rows);
            //console.log('db',list);

            res.status(200).json({ data: list[0] });
        })


    }

}


class NickelbackPubgAPI {
    urlSearchPlayerAPI = "https://api.pubg.com/shards/kakao/players";
    urlSeasonListAPI = "https://api.pubg.com/shards/kakao/seasons";
    urlSeasonRankAPI = "https://api.pubg.com/shards/kakao/players/{accountId}/seasons/{seasonId}/ranked";
    urlSeasonStatsAPI = "https://api.pubg.com/shards/kakao/players/{accountId}/seasons/{seasonId}";

    gameType = "squad";
    seasonList = [];//시즌정보 key List를 가진다.
    currentSeasonKey = "";
    //pastSeasonKey = "";
    currentKeySeq = 0;
    apiKeyList = [];

    constructor(apiKey) {
        this.apiKeyList = apiKey.split(",");
    }



    /**
     * PubgAPI를 사용하기위한 공통함수
     * @param {string} url 
     * @param {JsonObject} params 
     */
    getPromisePubgAPI(url, params) {

        if (this.currentKeySeq >= this.apiKeyList.length) {
            this.currentKeySeq = 0;
        }
        let pubgAPIHeader = {
            headers: {
                Authorization: "Bearer " + this.apiKeyList[this.currentKeySeq],
                Accept: "application/vnd.api+json"
            }
        };

        this.currentKeySeq++;
        //let this_ = this;
        if (params != null) {
            let strParams = "";
            for (let paramKey in params) {
                strParams += (strParams == "" ? "?" : "&") + paramKey + "=" + params[paramKey];
            }
            url += strParams;
        }
        return new Promise(function (resolve, reject) {
            Axios.get(url, pubgAPIHeader).then((_responseJson) => {
                resolve(_responseJson)
            }).catch(function (error) {
                let errorObject = {};
                errorObject.url = url;
                errorObject.errorCode = error.response.status;
                errorObject.errorMessage = error.response.statusText;
                reject(errorObject);
            });
        });
    }

    async setSeasonList() {
        //시즌정보를 불러온다.
        let this_ = this;
        await this.getPromisePubgAPI(this.urlSeasonListAPI, {}).then(function (responseJson) {
            /*
              //예시
              {
                "type": "season",
                "id": "division.bro.official.pc-2018-15",
                "attributes": {
                  "isOffseason": false,
                  "isCurrentSeason": true
                }
              },      
            */
            let seasonListData = responseJson.data.data;
            if (seasonListData != null && Array.isArray(seasonListData)) {
                seasonListData.forEach((seasonInfo, idx) => {
                    let seasonId = seasonInfo.id;
                    //console.log('seasoninfo',seasonInfo);
                    this_.seasonList.push(seasonId);
                    //isCurrentSeason 현재 시즌이 true인 값을 가져온다.
                    if (seasonInfo.attributes.isCurrentSeason == true) {
                        this_.currentSeasonKey = seasonId;
                    }
                });
            }
        });
    }



    async setPastSeasonList() {
        //시즌정보를 불러온다.
        let this_ = this;
        await this.getPromisePubgAPI(this.urlSeasonListAPI, {}).then(function (responseJson) {
            /*
              //예시
              {
                "type": "season",
                "id": "division.bro.official.pc-2018-15",
                "attributes": {
                  "isOffseason": false,
                  "isCurrentSeason": true
                }
              },      
            */
            let seasonListData = responseJson.data.data;
            if (seasonListData != null && Array.isArray(seasonListData)) {
                seasonListData.forEach((seasonInfo, idx) => {
                    let seasonId = seasonInfo.id;
                    //console.log('seasoninfo',seasonInfo);
                    this_.seasonList.push(seasonId);
                    //isCurrentSeason 현재 시즌이 true인 값을 가져온다.
                    if (seasonId.includes('pc') && seasonId.includes('17')) {
                        this_.pastSeasonKey = seasonId;
                    }
                });
            }
        });
    }

    // /**
    //  * 
    //  * @param {JsonObject} resJson (API서버에서 응답받은 JSON) 
    //  * @returns string (에러메시지)
    //  */
    //  getErrorMessage(resJson){
    //   if(resJson.errors!=null){
    //     let errorMessage = "";
    //     if(Array.isArray(resJson.errors)){
    //       errorMessage = resJson.errors[0].title;
    //       if(resJson.errors[0].detail!=null){
    //         errorMessage += " <" + resJson.errors[0].detail+">";
    //       }
    //     }
    //     return errorMessage;
    //   }else{
    //     return null;
    //   }
    // }

    /**
     * 플레이어 시즌 정보를 가져온다.
     * @param {string} playerNames
     * @param {string} seasonKey
     * @returns 
     */
    async getPlayerRankList(playerNames, seasonKey) {
        let userInfoMap = {};
        let this_ = this;
        if (seasonKey == null) {
            //시즌정보를 가져옴
            if (this.currentSeasonKey == "") {
                console.log("call season api ");
                await this.setSeasonList();
            }
            console.log("current season : " + this.currentSeasonKey);
            seasonKey = this.currentSeasonKey;
        }
        //유져명으로 유져 아이디 정보를 가져온다.
        await this.getPromisePubgAPI(this.urlSearchPlayerAPI, { "filter[playerNames]": playerNames })
            .then(async function (responseJson) {
                /*
                  //예시
                    {
                      "data": [
                        {
                          "type": "player",
                          "id": "account.51525c5501b54c6fa643c88d9cf48bf3",
                          "attributes": {
                            "titleId": "pubg",
                            "shardId": "kakao",
                            "patchVersion": "",
                            "name": "dators",
                            "stats": null
                          },
                          "relationships": {
                */
                let userList = responseJson.data.data;
                if (userList != null && Array.isArray(userList)) {
                    userList.forEach((userInfo, idx) => {
                        let userName = userInfo.attributes.name;
                        let userid = userInfo.id;
                        console.log(" userInfo [" + userName + "] : " + userid);
                        userInfoMap[userid] = {};
                        userInfoMap[userid].name = userName;
                        userInfoMap[userid].currentSeasonId = seasonKey.slice(seasonKey.length - 2);
                    });
                }

                //console.log("\n 1. userInfoMap : \n",userInfoMap);
                for (let userid in userInfoMap) {
                    try {
                        //유저아이디 , 시즌키, 게임타입 정보로 현재시즌 랭크정보를 가져온다.
                        await this_.getPromisePlayerRank(userid, this_.currentSeasonKey, this_.gameType)
                            .then(function (responseUserRankJson) {
                                /*
                                  {
                                    type: 'rankedplayerstats',
                                    attributes: { 
                                      rankedGameModeStats: { 
                                        squad : {
                                          currentTier : {}
                                          currentRankPoint : 000
                                        }
                                      } 
                                    },              
                                */
                                let userRankInfo = responseUserRankJson.data.data.attributes.rankedGameModeStats;
                                //console.log("userRankInfo : ",userRankInfo);
                                //console.log(responseUserRankJson);
                                if (userRankInfo.squad != null && userRankInfo.squad.currentTier != null) {
                                    userInfoMap[userid].currentTier = userRankInfo.squad.currentTier;
                                    userInfoMap[userid].currentRankPoint = userRankInfo.squad.currentRankPoint;
                                    userInfoMap[userid].bestRankPoint = userRankInfo.squad.bestRankPoint;
                                    userInfoMap[userid].roundsPlayed = userRankInfo.squad.roundsPlayed;
                                    userInfoMap[userid].wins = userRankInfo.squad.wins;
                                    userInfoMap[userid].kills = userRankInfo.squad.kills;
                                    userInfoMap[userid].assists = userRankInfo.squad.assists;
                                    userInfoMap[userid].teamKills = userRankInfo.squad.teamKills;
                                    userInfoMap[userid].avgDamage = userRankInfo.squad.damageDealt / userRankInfo.squad.roundsPlayed;
                                    userInfoMap[userid].kda = userRankInfo.squad.kda;
                                    userInfoMap[userid].winRatio = userRankInfo.squad.winRatio;
                                    userInfoMap[userid].top10Ratio = userRankInfo.squad.top10Ratio;

                                }
                            }).catch(function (errorObject) {
                                console.log(errorObject);
                                if (errorObject.errorCode != null) {
                                    let errorMessage = "[" + errorObject.errorCode + "] " + errorObject.errorMessage;
                                    userInfoMap[userid].errorMessage = errorMessage;
                                }
                            });
                    } catch (error) {
                        console.log("await promise error");
                    }
                }
            }
            ).catch(function (errorMessage) {
                console.log("errorMessage : " + errorMessage);
            });
        return userInfoMap;
    }

    /**
     * 플레이어 시즌 정보를 가져온다.
     * @param {string} playerNames
     * @param {string} seasonKey
     * @returns 
     */
    async getPlayerStatList(playerNames, seasonKey) {
        let userInfoMap = {};
        let this_ = this;
        if (seasonKey == null) {
            //시즌정보를 가져옴
            if (this.currentSeasonKey == "") {
                console.log("call season api ");
                await this.setSeasonList();
            }
            console.log("current season : " + this.currentSeasonKey);
            seasonKey = this.currentSeasonKey;
        }
        //유져명으로 유져 아이디 정보를 가져온다.
        await this.getPromisePubgAPI(this.urlSearchPlayerAPI, { "filter[playerNames]": playerNames })
            .then(async function (responseJson) {
                /*
                  //예시
                    {
                      "data": [
                        {
                          "type": "player",
                          "id": "account.51525c5501b54c6fa643c88d9cf48bf3",
                          "attributes": {
                            "titleId": "pubg",
                            "shardId": "kakao",
                            "patchVersion": "",
                            "name": "dators",
                            "stats": null
                          },
                          "relationships": {
                */
                let userList = responseJson.data.data;
                if (userList != null && Array.isArray(userList)) {
                    userList.forEach((userInfo, idx) => {
                        let userName = userInfo.attributes.name;
                        let userid = userInfo.id;
                        console.log(" userInfo [" + userName + "] : " + userid);
                        userInfoMap[userid] = {};
                        userInfoMap[userid].name = userName;
                        userInfoMap[userid].seasonId = userid.slice(userid.length - 2);
                    });
                }


                for (let userid in userInfoMap) {
                    try {
                        //유저아이디 , 시즌키, 게임타입 정보로 현재시즌 랭크정보를 가져온다.
                        await this_.getPromisePlayerStat(userid, this_.currentSeasonKey, this_.gameType)
                            .then(function (responseUserStatJson) {
                                console.log('responseUserStatJson', responseUserStatJson);
                                /*
                                  {
                                    type: 'rankedplayerstats',
                                    attributes: { 
                                      rankedGameModeStats: { 
                                        squad : {
                                          currentTier : {}
                                          currentRankPoint : 000
                                        }
                                      } 
                                    },              
                                */
                                let userStatInfo = responseUserStatJson.data.data;
                                console.log("userStatInfo : ", userStatInfo);
                            }).catch(function (errorObject) {
                                console.log(errorObject);
                                if (errorObject.errorCode != null) {
                                    let errorMessage = "[" + errorObject.errorCode + "] " + errorObject.errorMessage;
                                    userInfoMap[userid].errorMessage = errorMessage;
                                }
                            });
                    } catch (error) {
                        console.log("await promise error");
                    }
                }


            }
            ).catch(function (errorMessage) {
                console.log("errorMessage : " + errorMessage);
            });
        return userInfoMap;
    }

    getPromisePlayerRank(accountId, seasonId) {
        let url = this.urlSeasonRankAPI;
        url = url.replace("{accountId}", accountId).replace("{seasonId}", seasonId);
        return this.getPromisePubgAPI(url, { "filter[gamepad]": false });
    }

    getPromisePlayerStat(accountId, seasonId) {
        let url = this.urlSeasonStatAPI;
        url = url.replace("{accountId}", accountId).replace("{seasonId}", seasonId);
        return this.getPromisePubgAPI(url, { "filter[gamepad]": false });
    }
}