/**
 * @file
 * Example 003: List envelopes in the user's account
 * @author DocuSign
 */

const docusign = require('docusign-esign')
    , dsConfig = require('../../config/index.js').config
    , moment = require('moment')
    , path = require('path')
    ;

const eg003ListEnvelopes = exports
    , eg = 'eg003' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * List envelopes in the user's account
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg003ListEnvelopes.createController = async (req, res) => {
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

    // Step 2. Call the worker method
    let args = {
        accessToken: req.user.accessToken,
        basePath: req.session.basePath,
        accountId: req.session.accountId,
        }
      , results = null
      ;

    try {
        results = await eg003ListEnvelopes.worker (args)
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
    if (results) {

        res.render('pages/example_done', (err, html) => {
            res.send
        })


        res.render('pages/example_done', {
            title: "List envelopes results",
            h1: "Envelopes updated",
            h2: 'something else',
            message: `Results from the Envelopes::listStatusChanges method:`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * This function does the work of listing the envelopes
 */
// ***DS.snippet.0.start
eg003ListEnvelopes.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient)
      , results = null;

    // Step 1. List the envelopes
    // The Envelopes::listStatusChanges method has many options
    // See https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/listStatusChanges

    // The list status changes call requires at least a from_date OR
    // a set of envelopeIds. Here we filter using a from_date.
    // Here we set the from_date to filter envelopes for the last month
    // Use ISO 8601 date format
    let options = {envelopeIds: ['d63b3d44-ce20-4903-9149-5ca7a0462822']};

    // Exceptions will be caught by the calling function
    results = await envelopesApi.listStatusChanges(args.accountId, options);

    if (results.envelopes && results.envelopes.length > 0) {

        results.envelopes.forEach((envelope) => {

            console.log('id', envelope.envelopeId)
        });
    
        return results;
    }

    return {
        test: 12345
    }
}
// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg003ListEnvelopes.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuth.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg003ListEnvelopes', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "List envelopes",
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

