type Props = {
  projectSlug: string;
};

export const ProjectMarketplaceActivity = ({ projectSlug }: Props) => {
  console.log(projectSlug)

  return (
    <>
    </>
  )
 // const [activity, setActivity] = useState<MarketplaceProjectActivityData[]>();
 // const FILTER_OPTIONS: FilterOption[] = ActivityStatusFilters;

 // const { data: session } = useSession();
 // const { data: ret, isLoading } = useMarketplaceProjectActivity({
 //   projectSlug,
 // });
  //const [filterOptions, setFilterOptions] = useState<string>("");

 // const handleFilter = (filterOptions: string) => {
 //   setFilterOptions(filterOptions);
  //};

  /*const filteredListings = useMemo(() => {
    let filterListings = ret || [];

    if (filterOptions && filterListings?.length > 0) {
      const _filterOptions = (filterOptions as string).split(",");
      if (_filterOptions.length > 0) {
        const actionTypes: MarketplaceActionType[] = [];

        for (const option of _filterOptions) {
          if (option.startsWith("action_")) {
            const action = option.split("action_")[1];
            actionTypes.push(action as MarketplaceActionType);
          }
        }

        // filter filterListings on actionTypes
        if (actionTypes.length > 0) {
          filterListings = filterListings.filter((record) => {
            return actionTypes.includes(record.action);
          });
        }

        if (_filterOptions.includes("Mine")) {
          filterListings = filterListings.filter((record) => {
            return record.userId === session?.user.id;
          });
        }
      }
    }

    if (filterListings?.length > 0) {
      return filterListings;
    }

    return ret || [];
  }, [ret, filterOptions, session]);

  useEffect(() => {
    setActivity(filteredListings);
  }, [filteredListings]);*/

  
  /*return (
    <div className="w-full">
      <div className="my-5 flex justify-end">
        <FilterButton
          filterOptions={FILTER_OPTIONS}
          handleFilter={handleFilter}
        />
      </div>
      <Table
        data={activity ? activity : []}
        columns={cols}
        isLoading={false}
        pagination={null}
      />
    </div>
  );*/
};
