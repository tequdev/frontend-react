import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';

import { title, onFailedRequest } from '../../utils';

import { ReactComponent as LinkIcon } from "../../assets/images/link.svg";

export default function Nfts() {
  const { t } = useTranslation();
  const { address } = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState("first");
  const [errorMessage, setErrorMessage] = useState("");

  const checkApi = async () => {
    if (!address || !hasMore || (hasMore === "first" && data.length)) {
      return;
    }

    const response = await axios('v2/address/' + address + '?nfts=true' + (hasMore !== "first" ? ("&nfts[marker]=" + hasMore) : "")).catch(error => {
      onFailedRequest(error, setErrorMessage);
      setLoading(false);
    });
    setLoading(false);
    const newdata = response?.data;
    if (newdata) {
      if (newdata.address) {
        if (newdata.nfts) {
          setErrorMessage("");
          if (newdata.markers?.nfts) {
            setHasMore(newdata.markers.nfts);
          } else {
            setHasMore(false);
          }
          setData([...data, ...newdata.nfts]);
        } else {
          setErrorMessage(t("nfts.no-nfts"));
        }
      } else {
        if (newdata.error) {
          setErrorMessage(newdata.error);
        } else {
          setErrorMessage("Error");
          console.log(newdata);
        }
      }
    }
  }

  /*
  {
    "address": "r9spUPhPBfB6kQeF6vPhwmtFwRhBh2JUCG",
    "nfts": [
      {
        "flags": {
          "burnable": false,
          "onlyXRP": false,
          "trustLine": false,
          "transferable": true
        },
        "issuer": "r9spUPhPBfB6kQeF6vPhwmtFwRhBh2JUCG",
        "nftokenID": "000800005822D634B22590727E3CB2431F03C3B8B041528316E72FD300000001",
        "nftokenTaxon": 193871,
        "transferFee": null,
        "uri": "68747470733A2F2F697066732E696F2F697066732F6261667962656964727274376C6C796A6232717167337533376F61676E77726D707779756F686C74373637676B6E7635707966796A3668706F68342F6D657461646174612E6A736F6E",
        "url": "https://cloudflare-ipfs.com/ipfs/bafybeidrrt7llyjb2qqg3u37oagnwrmpwyuohlt767gknv5pyfyj6hpoh4/metadata.json",
        "nftSerial": 1,
        "metadata": {
          "name": "Pirate Edition",
          "description": "-Sanctum NFTs 007-\n\n&quot;The discovery of treasure in the land of Atlantis.&quot;",
          "external_url": "https://address.com/nfts",
          "attributes": [
            {
              "trait_type": "skin",
              "value": "PIRATES SKIN"
            }
          ],
          "category": "collectibles",
          "image_url": "ipfs://ipfs/bafybeievxhvot3tikwz4vupfkzmlybh6rzpwsz4gkscc7obc6dkbyhrvqe/image.jpeg",
          "animation_url": "ipfs://ipfs/bafybeievxhvot3tikwz4vupfkzmlybh6rzpwsz4gkscc7obc6dkbyhrvqe/animation.jpeg"
        }
      }
    ]
  }
  */

  useEffect(() => {
    checkApi();
    title(t("menu.nfts") + " " + address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>
    <div className="content-text">
      <h4 className="center">{t("menu.nfts") + " " + address}</h4>
      <InfiniteScroll
        dataLength={data.length}
        next={checkApi}
        hasMore={hasMore}
        loader={!errorMessage &&
          <p className="center">{t("nfts.load-more")}</p>
        }
        endMessage={<p className="center">{t("nfts.end")}</p>}
      // below props only if you need pull down functionality
      //refreshFunction={this.refresh}
      //pullDownToRefresh
      //pullDownToRefreshThreshold={50}
      //</>pullDownToRefreshContent={
      //  <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
      //}
      //releaseToRefreshContent={
      //  <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
      //}
      >
        <table className="table-large">
          <thead>
            <tr>
              <th>{t("table.index")}</th>
              <th>{t("table.name")}</th>
              <th>NFT</th>
              <th>{t("table.issuer")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ?
              <tr className='center'><td colSpan="4"><span className="waiting"></span></td></tr>
              :
              <>
                {!errorMessage ? data.map((nft, i) =>
                  <tr key={nft.nftokenID}>
                    <td className="center">{i + 1}</td>
                    <td>{nft.metadata?.name}</td>
                    <td className='center'><a href={"/explorer/" + nft.nftokenID}><LinkIcon /></a></td>
                    <td className='center'><a href={"/explorer/" + nft.issuer}><LinkIcon /></a></td>
                  </tr>) : <tr className='center'><td colSpan="4">{errorMessage}</td></tr>
                }
              </>
            }
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  </>;
};
