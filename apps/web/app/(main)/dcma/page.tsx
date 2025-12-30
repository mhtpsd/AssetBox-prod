import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA Policy',
  description:  'AssetBox DMCA Copyright Policy',
};

export default function DMCAPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold">DMCA Copyright Policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-gray mt-8 dark:prose-invert max-w-none">
        <h2>Copyright Infringement Notification</h2>
        <p>
          AssetBox respects the intellectual property rights of others and expects our users to do
          the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond
          to valid notices of copyright infringement. 
        </p>

        <h2>Filing a DMCA Notice</h2>
        <p>
          If you believe that content on AssetBox infringes your copyright, please provide our
          Copyright Agent with the following information:
        </p>

        <ol>
          <li>
            <strong>Identification of the copyrighted work:</strong> A description of the
            copyrighted work that you claim has been infringed, or if multiple works, a
            representative list. 
          </li>
          <li>
            <strong>Identification of the infringing material: </strong> A description of where the
            material you claim is infringing is located on the Platform (please provide URLs).
          </li>
          <li>
            <strong>Contact information:</strong> Your address, telephone number, and email address.
          </li>
          <li>
            <strong>Good faith statement:</strong> A statement that you have a good faith belief
            that the disputed use is not authorized by the copyright owner, its agent, or the law. 
          </li>
          <li>
            <strong>Accuracy statement:</strong> A statement, under penalty of perjury, that the
            information in your notice is accurate and that you are the copyright owner or
            authorized to act on the copyright owner's behalf.
          </li>
          <li>
            <strong>Signature:</strong> Your physical or electronic signature.
          </li>
        </ol>

        <h2>Send DMCA Notices To: </h2>
        <div className="rounded-lg border bg-muted p-6">
          <p className="font-mono">
            Copyright Agent
            <br />
            AssetBox
            <br />
            Email: dmca@assetbox.com
            <br />
            Subject: DMCA Takedown Request
          </p>
        </div>

        <h2>Counter-Notification</h2>
        <p>
          If you believe your content was removed by mistake or misidentification, you may file a
          counter-notification with the following information:
        </p>

        <ol>
          <li>Your physical or electronic signature</li>
          <li>Identification of the content that was removed and its location before removal</li>
          <li>
            A statement under penalty of perjury that you have a good faith belief the content was
            removed as a result of mistake or misidentification
          </li>
          <li>
            Your name, address, and telephone number, and a statement that you consent to
            jurisdiction of the Federal District Court
          </li>
        </ol>

        <h2>Repeat Infringer Policy</h2>
        <p>
          AssetBox will terminate the accounts of users who are repeat infringers of copyright. 
        </p>

        <h2>False Claims</h2>
        <p>
          Please note that under Section 512(f) of the DMCA, any person who knowingly materially
          misrepresents that material or activity is infringing may be subject to liability. 
        </p>

        <h2>Processing Time</h2>
        <p>
          We will review and process valid DMCA notices within 2-5 business days. Upon receipt of a
          valid notice, we will remove or disable access to the allegedly infringing content.
        </p>
      </div>
    </div>
  );
}