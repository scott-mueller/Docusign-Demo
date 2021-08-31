 /**
 * @file
 * Demo Viewer
 * @author Scott Mueller
 */

 const docusign = require('docusign-esign');
 const dsConfig = require('../../config/index.js').config;
 const moment = require('moment');
 const path = require('path');

const demoViewer = exports
 , eg = 'demoViewer' // This example reference.
 , mustAuthenticate = '/ds/mustAuthenticate'
 , minimumBufferMin = 3
 ;

/**
* List envelopes in the user's account
* @param {object} req Request obj
* @param {object} res Response obj
*/
demoViewer.createController = async (req, res) => {
 // Step 1. Check the token
 // At this point we should have a good token. But we
 // double-check here to enable a better UX to the user.
 let tokenOK = req.dsAuth.checkToken(minimumBufferMin);
 if (! tokenOK) {
     req.flash('info', 'Sorry, you need to re-authenticate.');
     // Save the current operation so it will be resumed after authentication
     req.dsAuth.setEg(req, eg);
     res.redirect(mustAuthenticate);
 }

 let envelopes = null;
 let envelopeDetails = [];

 try {
    const getEnvelopeArgs = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
    };
    envelopes = await demoViewer.getEnvelopes (getEnvelopeArgs);

    for (let i = 0; i < envelopes.envelopes.length; ++i) {

        console.log(i, envelope.envelopeId);

        const getEnvDetailsArgs = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeId: envelope.envelopeId
        };

        try {

            //envelopeDetails.push({envelopeId: envelope.envelopeId, details: await demoViewer.getEnvelopeDetails( getEnvDetailsArgs) });
        }
        catch (e) {

            envelopeDetails.push( {envelopeId: envelope.envelopeId, details: e} )
        }
    }

 }
 catch (error) {

     let errorBody = error && error.response && error.response.body
         // we can pull the DocuSign error code and message from the response body
     , errorCode = errorBody && errorBody.errorCode
     , errorMessage = errorBody && errorBody.message
     ;
     // In production, may want to provide customized error messages and
     // remediation advice to the user.
     res.render('pages/error', {err: error, errorCode: errorCode, errorMessage: errorMessage});
 }

    // At this point we have results already
    let toRender = {e: envelopeDetails};

    /*if (results.envelopes && results.envelopes.length > 0) {
        
        toRender = results;
    }
    else {
        toRender = {
            test: 1234567890
        }
    }*/

    res.render('pages/demo/demoPageResponse', {
        title: "List envelopes results",
        h1: "Envelopes updated",
        h2: 'AHAHAHAHAH',
        message: `Results from the Envelopes::listStatusChanges method:`,
        json: JSON.stringify(toRender)
    });
}

demoViewer.getEnvelopes = async (args) => {
 // Data for this method
 // args.basePath
 // args.accessToken
 // args.accountId


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Step 1. List the envelopes

    // Set our options
    //let options = {envelopeIds: ['d63b3d44-ce20-4903-9149-5ca7a0462823']};
    let options = {fromDate: moment().subtract(30, 'days').format()};

    // Exceptions will be caught by the calling function
    return await envelopesApi.listStatusChanges(args.accountId, options);

    // Create a new array containing only envelopeIds
    // Make a call for each envelope, to get info
    // store the documentIds for each envelope somewhere I can access them later - on the html element
}

demoViewer.getEnvelopeDetails = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId
    // args.envelopeId


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient)
      , results = null;

    // Step 1. Call Envelopes::get
    // Exceptions will be caught by the calling function
    results = await envelopesApi.getEnvelope(args.accountId, args.envelopeId, null);
    return results;
}


/**
* Form page for this application
*/
demoViewer.getController = (req, res) => {
 // Check that the authentication token is ok with a long buffer time.
 // If needed, now is the best time to ask the user to authenticate
 // since they have not yet entered any information into the form.
 let tokenOK = req.dsAuth.checkToken();
 if (tokenOK) {
     res.render('pages/demo/demoPageIntro', {
         eg: eg, csrfToken: req.csrfToken(),
         title: "Demo Project",
         sourceFile: path.basename(__filename),
         sourceUrl: dsConfig.githubExampleUrl + 'eSignature/' + path.basename(__filename),
         documentation: dsConfig.documentation + eg,
         showDoc: dsConfig.documentation
     });
 } else {
     // Save the current operation so it will be resumed after authentication
     req.dsAuth.setEg(req, eg);
     res.redirect(mustAuthenticate);
 }
}

