export type propPB = {
    completedno: number,
    totalno: number
}

const ProgressBar = ({completedno, totalno} : propPB) =>{
    return(
        <>
            <h3>Progress Bar: </h3>
            <span>{completedno}</span>
            <span>/</span>
            <span>{totalno}</span>
        </>
    )
}

export default ProgressBar