const { Organizations } = require('../models/organizations')
const qs = require('querystring');
const axios = require('axios').default;
const url = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token'

const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};


exports.checkCardNumber = async (req, res) => {
  var isPresent = false

  const existing = await Organizations.findOne({ domainName: { $eq: req.params.domain } })
  if (!existing) return res.status(501).send({ msg: "Domain not registered." })
  let userList = []
  userList = existing.users
  try {
    userList.forEach(async function (value, index) {

      if (req.params.cardNumber === value.cardNumber) {
        isPresent = true
        if (value.isRevoked == false) {
          var currentUser = value
          const data = {
            refresh_token: currentUser.refreshToken,
            grant_type: 'refresh_token'
          };
          axios.post(url, qs.stringify(data), config)
            .then(async function (response) {
              if (response.status == 200) {
                const newData = {
                  accessToken: response.data.access_token,
                  refreshToken: response.data.refresh_token,
                  updatedAt: new Date().toLocaleString("en-US", { timeZone: "Europe/Dublin" }),
                  isRevoked: false,
                  cardNumber: req.params.cardNumber
                };
                userList[index] = newData
                existing.users = userList
                await existing.save()
                return res.status(200).send(newData)
              } else {
                const newData = {
                  accessToken: currentUser.accessToken,
                  refreshToken: currentUser.refreshToken,
                  updatedAt: new Date().toLocaleString("en-US", { timeZone: "Europe/Dublin" }),
                  isRevoked: true,
                  cardNumber: req.params.cardNumber
                };
                userList[index] = newData
                existing.users = userList
                await existing.save()
                return res.status(500).send(newData)
              }
            })
            .catch(async function (error) {
              const newData = {
                accessToken: currentUser.accessToken,
                refreshToken: currentUser.refreshToken,
                updatedAt: new Date().toLocaleString("en-US", { timeZone: "Europe/Dublin" }),
                isRevoked: true,
                cardNumber: req.params.cardNumber
              };
              userList[index] = newData
              existing.users = userList
              await existing.save()
              return res.status(500).send(newData)
            });

        } else {
          return res.status(500).send({ msg: "Token Revoked." })
        }

      }
    })
  } catch (err) {
    console.log(err)
  }

  if (isPresent == false) {
    return res.status(404).send({ msg: "User not registered." })
  }

}


exports.getTokensFromAuth = async (req, res) => {

  const existing = await Organizations.findOne({ domainName: { $eq: req.params.domain } })
  if (!existing) return res.status(404).send({ msg: "Domain not registered." })
  let userList = []
  userList = existing.users
  const client_id = "6afed232-70e3-42df-964e-015f966e3206"
  const scope =
    "User.Read offline_access Files.Read Files.Read.All Files.ReadWrite Files.ReadWrite.All Sites.Read.All Sites.ReadWrite.All"
  const redirect_uri = "msauth://com.caleta.caletascantoonedrive/df%2FWrQM67qwAZFa%2F4i5uTORfZgI%3D"
  const grant_type = "authorization_code"
  const data = {
    client_id: client_id,
    scope: scope,
    code: req.params.authToken,
    redirect_uri: redirect_uri,
    grant_type: grant_type
  };

  try {
    await axios.post(url,
      qs.stringify(data), config)
      .then(async function (response) {

        if (response.status == 200) {
          const newData = {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            updatedAt: new Date().toLocaleString("en-US", { timeZone: "Europe/Dublin" }),
            isRevoked: false,
            cardNumber: req.params.cardNumber
          }

          let check = false
          let insertIndex = 0

          if (userList.length === 0) {
            userList.push(newData)
            existing.users = userList
            await existing.save()
            return res.status(201).send(newData)
          }
          else {
            userList.forEach(async function (value, index) {
              if (req.params.cardNumber === value.cardNumber) {
                check = true
                insertIndex = index
              }
            })
          }

          if (check) {
            userList[insertIndex] = newData
          } else {
            userList.push(newData)
          }

          existing.users = userList
          await existing.save()
          return res.status(201).send(newData)

        }

        else {
          return res.status(400).send({ msg: "Unable to Get Access Token From Authorization Token." });
        }

      })
      .catch(async function (err) {
        return res.status(400).send({ msg: "Unable to Get Access Token From Authorization Token. " + err });
      });
  } catch (error) {
    console.log(error
    )
  }


}



exports.addDomain = async (req, res) => {
  const existing = await Organizations.findOne({
    domainName: { $eq: req.params.domainName }
  })
  if (existing)
    return res.status(302).send({ msg: "Domain already registered." })

  let data = new Organizations({ domainName: req.params.domainName, adsAllowed: false, advertisements: [], users: [] });
  await data.save()
  return res.status(201).send({ msg: "Domain Registered." });

}


exports.getAllOrganizations = async (req, res) => {
  const allOrganizations = await Organizations.find()
  if (!allOrganizations) return res.status(204).send({ msg: "No Organization present." })
  return res.status(202).send(allOrganizations);
}

